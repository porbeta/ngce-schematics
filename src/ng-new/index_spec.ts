import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';


const collectionPath = path.join(__dirname, '../collection.json');


describe('ng-new', () => {
  it('creates a custom element', async () => {
    const runner = new SchematicTestRunner('ng-new', collectionPath);
    const tree = await runner.runSchematicAsync('ng-new', { name: "custom-element", version: "1.0.0", applicationType: "application" }, Tree.empty()).toPromise();

    expect(tree.files).toEqual(jasmine.arrayContaining([
      "/custom-element/angular.json",
      "/custom-element/package.json",
      "/custom-element/README.md",
      "/custom-element/tsconfig.json",
      "/custom-element/tslint.json",
      "/custom-element/.editorconfig",
      "/custom-element/.gitignore",
      "/custom-element/.browserslistrc",
      "/custom-element/karma.conf.js",
      "/custom-element/tsconfig.app.json",
      "/custom-element/tsconfig.spec.json",
      "/custom-element/src/favicon.ico",
      "/custom-element/src/index.html",
      "/custom-element/src/main.ts",
      "/custom-element/src/polyfills.ts",
      "/custom-element/src/styles.css",
      "/custom-element/src/test.ts",
      "/custom-element/src/assets/.gitkeep",
      "/custom-element/src/environments/environment.prod.ts",
      "/custom-element/src/environments/environment.ts",
      "/custom-element/src/app/app.module.ts",
      "/custom-element/src/app/app.component.html",
      "/custom-element/src/app/app.component.spec.ts",
      "/custom-element/src/app/app.component.ts",
      "/custom-element/src/app/app.component.css",
      "/custom-element/e2e/protractor.conf.js",
      "/custom-element/e2e/tsconfig.json",
      "/custom-element/e2e/src/app.e2e-spec.ts",
      "/custom-element/e2e/src/app.po.ts"
    ]));
  });

  it('creates an application', async () => {
    const runner = new SchematicTestRunner('ng-new', collectionPath);
    const tree = await runner.runSchematicAsync('ng-new', { name: "custom-element", version: "1.0.0", applicationType: "customElement" }, Tree.empty()).toPromise();

    expect(tree.files).toEqual(jasmine.arrayContaining([
      "/custom-element/angular.json",
      "/custom-element/package.json",
      "/custom-element/README.md",
      "/custom-element/tsconfig.json",
      "/custom-element/tslint.json",
      "/custom-element/.editorconfig",
      "/custom-element/.gitignore",
      "/custom-element/.browserslistrc",
      "/custom-element/karma.conf.js",
      "/custom-element/tsconfig.app.json",
      "/custom-element/tsconfig.spec.json",
      "/custom-element/src/favicon.ico",
      "/custom-element/src/index.html",
      "/custom-element/src/main.ts",
      "/custom-element/src/polyfills.ts",
      "/custom-element/src/styles.css",
      "/custom-element/src/test.ts",
      "/custom-element/src/assets/.gitkeep",
      "/custom-element/src/environments/environment.prod.ts",
      "/custom-element/src/environments/environment.ts",
      "/custom-element/src/app/app.module.ts",
      "/custom-element/src/app/app.component.html",
      "/custom-element/src/app/app.component.spec.ts",
      "/custom-element/src/app/app.component.ts",
      "/custom-element/src/app/app.component.css",
      "/custom-element/e2e/protractor.conf.js",
      "/custom-element/e2e/tsconfig.json",
      "/custom-element/e2e/src/app.e2e-spec.ts",
      "/custom-element/e2e/src/app.po.ts"
    ]));
  });
});
