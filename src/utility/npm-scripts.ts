import { JsonAstObject, JsonParseMode, parseJsonAst } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import {
  appendPropertyInAstObject,
  findPropertyInAstObject,
  insertPropertyInAstObjectInOrder,
} from '@schematics/angular/utility/json-utils';
import { findNodes } from '@schematics/angular/utility/ast-utils';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';

export function updatePackageJsonScript(tree: Tree, scriptName: string, scriptValue: string, packageJsonPath: string, overwrite: boolean = false): void {
    const packageJsonAst = _getJsonFileAst(tree, packageJsonPath);
    const depsNode = findPropertyInAstObject(packageJsonAst, 'scripts');
    const recorder = tree.beginUpdate(packageJsonPath);
    
    if (!depsNode) {
        // Haven't found the dependencies key, add it to the root of the package.json.
        appendPropertyInAstObject(recorder, packageJsonAst, 'scripts', { [scriptName]: scriptValue }, 2);
    } else if (depsNode.kind === 'object') {
        // check if package already added
        const depNode = findPropertyInAstObject(depsNode, scriptName);

        if (!depNode) {
            // Package not found, add it.
            insertPropertyInAstObjectInOrder(recorder, depsNode, scriptName, scriptValue, 4);
        } else if (overwrite) {
            // Package found, update version if overwrite.
            const { end, start } = depNode;
            recorder.remove(start.offset, end.offset - start.offset);
            recorder.insertRight(start.offset, JSON.stringify(scriptValue));
        }
    }

    tree.commitUpdate(recorder);
}

export function updatePackageJsonSchematics(tree: Tree, schematicsValue: string, packageJsonPath: string, overwrite: boolean = false): void {
    const packageJsonAst = _getJsonFileAst(tree, packageJsonPath);
    const depsNode = findPropertyInAstObject(packageJsonAst, 'schematics');
    const recorder = tree.beginUpdate(packageJsonPath);
    
    if (!depsNode) {
        // Haven't found the dependencies key, add it to the root of the package.json.
        appendPropertyInAstObject(recorder, packageJsonAst, 'schematics', schematicsValue, 2);
    } else if (overwrite) {
        // Package found, update version if overwrite.
        const { end, start } = depsNode;
        recorder.remove(start.offset, end.offset - start.offset);
        recorder.insertRight(start.offset, JSON.stringify(schematicsValue));
    }

    tree.commitUpdate(recorder);
}

export function updateBuilderToNgxBuildPlus(tree: Tree, angularJsonPath: string, name: string) {
    const angularJsonSource = _readJsonFileIntoSource(tree, angularJsonPath);
    
    let modifiedAngularJsonObj = JSON.parse(angularJsonSource.getFullText());
    modifiedAngularJsonObj["projects"][name]["architect"]["build"]["builder"] = "ngx-build-plus:browser";

    const recorder = tree.beginUpdate(angularJsonPath);

    recorder.remove(0, angularJsonSource.getFullText().length);
    recorder.insertLeft(0, JSON.stringify(modifiedAngularJsonObj, null, 4));

    tree.commitUpdate(recorder);
}

export function addGlobAssetForDist(tree: Tree, path: string) {
    const angularJsonSource = _readJsonFileIntoSource(tree, path);
    
    let modifiedAngularJsonObj = JSON.parse(angularJsonSource.getFullText());
    const defaultProject = modifiedAngularJsonObj["defaultProject"];

    modifiedAngularJsonObj["projects"][defaultProject]["architect"]["build"]["options"]["assets"].push({
        "glob": "**/*",
        "input": "./dist",
        "output": "./dist"
    });

    const recorder = tree.beginUpdate(path);

    recorder.remove(0, angularJsonSource.getFullText().length);
    recorder.insertLeft(0, JSON.stringify(modifiedAngularJsonObj, null, 4));

    tree.commitUpdate(recorder);
}


export function addScriptUrlToAppModule(tree: Tree, path: string, name: string) {
  
    try {
        const source = _readJsonFileIntoSource(tree, path);
        const allVariables = findNodes(source, ts.SyntaxKind.VariableDeclaration);

        // get nodes that map to variable name 'scriptUrls'
        const scriptUrls = _findNodeByIdentifier(allVariables, 'scriptUrls');

        if(scriptUrls != null) {
            // get nodes that map to import statements from the file fileName
            const scriptUrlsArray = findNodes(scriptUrls, ts.SyntaxKind.ArrayLiteralExpression)[0];
            const scriptUrlStrings = findNodes(scriptUrlsArray, ts.SyntaxKind.StringLiteral);

            let toInsert = "";

            if(scriptUrlStrings.length > 0) {
                toInsert += ",\n          "
                
            }
            toInsert += `"/dist/${name}/main.js"`;

            const recorder = tree.beginUpdate(path);
            recorder.insertLeft(scriptUrlsArray.getEnd() - 1, toInsert);
            tree.commitUpdate(recorder);
        }
    } catch(e) {
        if(e.message !== "Could not read src/app/app.module.ts.") {
            throw e;
        }
    }
}

function _readJsonFile(tree: Tree, path: string) {
    const buffer = tree.read(path);
    if (buffer === null) {
        throw new SchematicsException(`Could not read ${path}.`);
    }
    
    return buffer.toString();
}

function _readJsonFileIntoSource(tree: Tree, path: string) {
    const sourceText = _readJsonFile(tree, path);

    return ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true);
}

function _getJsonFileAst(tree: Tree, jsonPath: string): JsonAstObject {
    const content = _readJsonFile(tree, jsonPath);

    const packageJson = parseJsonAst(content, JsonParseMode.Strict);
    if (packageJson.kind != 'object') {
        throw new SchematicsException(`Invalid ${jsonPath}. Was expecting an object`);
    }

    return packageJson;
}

function _findNodeByIdentifier(nodes: ts.Node[], matchString: string) {
    const nodeList = nodes.filter(node => {
        const variables = node.getChildren()
        .filter(child => child.kind === ts.SyntaxKind.Identifier)
        .map(n => (n as ts.StringLiteral).text);

        return variables.filter(variable => variable === matchString).length === 1;
    });

    if(nodeList.length == 1) {
        return nodeList[0];
    }

    return null;
}
