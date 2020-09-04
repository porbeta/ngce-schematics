import { EmptyTree } from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import {
    updateScript
} from './npm-scripts';


describe('npm-scripts', () => {
  describe('add NPM script', () => {
    let tree: UnitTestTree;
    const pkgJsonPath = '/package.json';
    beforeEach(() => {
      tree = new UnitTestTree(new EmptyTree());
      tree.create(pkgJsonPath, '{}');
    });

    it('should add an NPM script', () => {
        updateScript(tree, "dev", "ng serve harness", pkgJsonPath);
        const pkgJson = JSON.parse(tree.readContent(pkgJsonPath));
        expect(pkgJson["scripts"]["dev"]).toEqual("ng serve harness");
    });

    it('should handle an existing NPM script', () => {
        updateScript(tree, "dev", "ng serve", pkgJsonPath, true);
        updateScript(tree, "dev", "ng serve harness", pkgJsonPath, true);
        const pkgJson = JSON.parse(tree.readContent(pkgJsonPath));
        expect(pkgJson["scripts"]["dev"]).toEqual("ng serve harness");
    });

    it('should throw when missing package.json', () => {
        expect((() => updateScript(new EmptyTree(), "dev", "ng serve harness", pkgJsonPath))).toThrow();
    });

  });
});
