import { JsonAstObject, JsonParseMode, parseJsonAst } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import {
  appendPropertyInAstObject,
  findPropertyInAstObject,
  insertPropertyInAstObjectInOrder,
} from '@schematics/angular/utility/json-utils';
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
