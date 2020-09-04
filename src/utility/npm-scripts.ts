import { JsonAstObject, JsonParseMode, parseJsonAst } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import {
  appendPropertyInAstObject,
  findPropertyInAstObject,
  insertPropertyInAstObjectInOrder,
} from '@schematics/angular/utility/json-utils';

export function updateScript(tree: Tree, scriptName: string, scriptValue: string, packageJsonPath: string, overwrite: boolean = false): void {
    const packageJsonAst = _readPackageJson(tree, packageJsonPath);
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

function _readPackageJson(tree: Tree, packageJsonPath: string): JsonAstObject {
    const buffer = tree.read(packageJsonPath);
    if (buffer === null) {
        throw new SchematicsException('Could not read package.json.');
    }
    const content = buffer.toString();

    const packageJson = parseJsonAst(content, JsonParseMode.Strict);
    if (packageJson.kind != 'object') {
        throw new SchematicsException('Invalid package.json. Was expecting an object');
    }

    return packageJson;
}
