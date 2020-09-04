import { Path, join } from '@angular-devkit/core';
import { DirEntry, Tree } from '@angular-devkit/schematics';

export function findFile(host: Tree, path: string, filename: string): Path {

    let dir: DirEntry | null = host.getDir('/' + path);

    while (dir) {
        const allMatches = dir.subfiles.filter(p => p.toString() == filename);

        if (allMatches.length == 1) {
            return join(dir.path, allMatches[0]);
        }

        dir = dir.parent;
    }

    const errorMsg = `Could not find the file under path '${path}'.`;

    throw new Error(errorMsg);
}
  
export function hasFile(host: Tree, path: string, filename: string): boolean {
    try {
        findFile(host, path, filename);
    } catch(e) {
        return false;
    }
    
    return true;
}