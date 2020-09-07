import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Schema as WorkspaceOptions } from '../workspace/schema';
import { Schema as ApplicationOptions, ApplicationType } from './schema';

const collectionPath = path.join(__dirname, '../collection.json');


describe('application', () => {
  const schematicRunner = new SchematicTestRunner(
    '@schematics/angular',
    require.resolve('../collection.json'),
  );

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };

  let workspaceTree: UnitTestTree;
  beforeEach(async () => {
    workspaceTree = await schematicRunner.runSchematicAsync('workspace', workspaceOptions).toPromise();
  });


  it('creates an application', async () => {
    const options: ApplicationOptions = {
      name: 'foo',
      inlineStyle: false,
      inlineTemplate: false,
      routing: false,
      skipPackageJson: false,
      applicationType: ApplicationType.Application
    };

    const runner = new SchematicTestRunner('application', collectionPath);
    const tree = await runner.runSchematicAsync('application', options, workspaceTree).toPromise();

    expect(tree.files).toEqual(jasmine.arrayContaining([
      "/angular.json",
      "/package.json",
      "/README.md",
      "/tsconfig.json",
      "/tslint.json",
      "/.editorconfig",
      "/.gitignore",
      "/projects/foo/.browserslistrc",
      "/projects/foo/karma.conf.js",
      "/projects/foo/tsconfig.app.json",
      "/projects/foo/tsconfig.spec.json",
      "/projects/foo/tslint.json",
      "/projects/foo/src/favicon.ico",
      "/projects/foo/src/index.html",
      "/projects/foo/src/main.ts",
      "/projects/foo/src/polyfills.ts",
      "/projects/foo/src/styles.css",
      "/projects/foo/src/test.ts",
      "/projects/foo/src/assets/.gitkeep",
      "/projects/foo/src/environments/environment.prod.ts",
      "/projects/foo/src/environments/environment.ts",
      "/projects/foo/src/app/app.module.ts",
      "/projects/foo/src/app/app.component.html",
      "/projects/foo/src/app/app.component.spec.ts",
      "/projects/foo/src/app/app.component.ts",
      "/projects/foo/src/app/app.component.css",
      "/projects/foo/e2e/protractor.conf.js",
      "/projects/foo/e2e/tsconfig.json",
      "/projects/foo/e2e/src/app.e2e-spec.ts",
      "/projects/foo/e2e/src/app.po.ts"
    ]));
  });

  it('creates a custom element', async () => {
    const options: ApplicationOptions = {
      name: 'foo',
      inlineStyle: false,
      inlineTemplate: false,
      skipPackageJson: false,
      applicationType: ApplicationType.CustomElement
    };

    const runner = new SchematicTestRunner('application', collectionPath);
    const tree = await runner.runSchematicAsync('application', options, workspaceTree).toPromise();

    expect(tree.files).toEqual(jasmine.arrayContaining([
      "/angular.json",
      "/package.json",
      "/README.md",
      "/tsconfig.json",
      "/tslint.json",
      "/.editorconfig",
      "/.gitignore",
      "/projects/foo/.browserslistrc",
      "/projects/foo/.npmignore",
      "/projects/foo/karma.conf.js",
      "/projects/foo/tsconfig.app.json",
      "/projects/foo/tsconfig.spec.json",
      "/projects/foo/tslint.json",
      "/projects/foo/src/favicon.ico",
      "/projects/foo/src/index.html",
      "/projects/foo/src/main.ts",
      "/projects/foo/src/polyfills.ts",
      "/projects/foo/src/styles.css",
      "/projects/foo/src/test.ts",
      "/projects/foo/src/assets/.gitkeep",
      "/projects/foo/src/environments/environment.prod.ts",
      "/projects/foo/src/environments/environment.ts",
      "/projects/foo/src/app/app.module.ts",
      "/projects/foo/src/app/app.component.html",
      "/projects/foo/src/app/app.component.spec.ts",
      "/projects/foo/src/app/app.component.ts",
      "/projects/foo/src/app/app.component.css",
      "/projects/foo/e2e/protractor.conf.js",
      "/projects/foo/e2e/tsconfig.json",
      "/projects/foo/e2e/src/app.e2e-spec.ts",
      "/projects/foo/e2e/src/app.po.ts"
    ]));
  });
});
