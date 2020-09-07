import { EmptyTree } from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import {
    updatePackageJsonScript,
    updateBuilderToNgxBuildPlus
} from './npm-scripts';

describe('npm-scripts', () => {
  describe('updatePackageJsonScript', () => {
    let tree: UnitTestTree;
    
    const pkgJsonPath = '/package.json';

    beforeEach(() => {
      tree = new UnitTestTree(new EmptyTree());
      tree.create(pkgJsonPath, '{}');
    });

    it('should add an NPM script', () => {
        updatePackageJsonScript(tree, "dev", "ng serve harness", pkgJsonPath);
        const pkgJson = JSON.parse(tree.readContent(pkgJsonPath));
        expect(pkgJson["scripts"]["dev"]).toEqual("ng serve harness");
    });

    it('should handle an existing NPM script', () => {
        updatePackageJsonScript(tree, "dev", "ng serve", pkgJsonPath, true);
        updatePackageJsonScript(tree, "dev", "ng serve harness", pkgJsonPath, true);
        const pkgJson = JSON.parse(tree.readContent(pkgJsonPath));
        expect(pkgJson["scripts"]["dev"]).toEqual("ng serve harness");
    });

    it('should throw when missing package.json', () => {
        expect((() => updatePackageJsonScript(new EmptyTree(), "dev", "ng serve harness", pkgJsonPath))).toThrow();
    });
  });

  describe('', () => {
    let tree: UnitTestTree;
    
    const angularJsonPath: string = '/angular.json';

    beforeEach(() => {
      tree = new UnitTestTree(new EmptyTree());
      tree.create(angularJsonPath, `
      {
        "projects": {
          "custom-element": {
            "architect": {
              "build": {
                "builder": "@angular-devkit/build-angular:browser"
              }
            }
          }
        }
      }`);
    });

    it('should update builder with ngx-build-plus', () => {
      updateBuilderToNgxBuildPlus(tree, angularJsonPath, "custom-element");
      const angularJson = JSON.parse(tree.readContent(angularJsonPath));
      expect(angularJson["projects"]["custom-element"]["architect"]["build"]["builder"]).toEqual("ngx-build-plus:browser");
    });
  })
});
