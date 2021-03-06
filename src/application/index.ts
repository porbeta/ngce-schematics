import {
  join,
  normalize,
  strings,
} from '@angular-devkit/core';
import {
  MergeStrategy,
  apply,
  applyTemplates,
  filter,
  mergeWith,
  move,
  noop,
  url
} from '@angular-devkit/schematics';
import { NodeDependencyType, addPackageJsonDependency } from '@schematics/angular/utility/dependencies';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { Rule, SchematicContext, Tree, chain, externalSchematic } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { Schema as ApplicationOptions, ApplicationType } from '../application/schema';
import { Schema as ComponentOptions } from '@schematics/angular/component/schema';
import {
  updatePackageJsonScript,
  updatePackageJsonSchematics,
  updateBuilderToNgxBuildPlus,
  addGlobAssetForDist,
  addScriptUrlToAppModule
} from '../utility/npm-scripts';
import { hasFile } from '../utility/find-file';


function addCustomElementDependenciesToPackageJson(options: ApplicationOptions, packageJsonPath: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    [
      {
        type: NodeDependencyType.Default,
        name: '@angular/elements',
        version: "latest",
      },
      {
        type: NodeDependencyType.Default,
        name: 'ngx-build-plus',
        version: "latest",
      },
      {
        type: NodeDependencyType.Default,
        name: 'document-register-element',
        version: "latest",
      }
    ].forEach(dependency => addPackageJsonDependency(host, dependency, packageJsonPath));

    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

    return host;
  };
}

function addApplicationDependenciesToPackageJson(options: ApplicationOptions, packageJsonPath: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    [
      {
        type: NodeDependencyType.Default,
        name: 'document-register-element',
        version: "latest",
      }
    ].forEach(dependency => addPackageJsonDependency(host, dependency, packageJsonPath));

    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

    return host;
  };
}

function updateCustomElementsNpmScripts(packageJsonPath: string, name: string, updateBuildScript: boolean | undefined): Rule {
  return (host: Tree) => {
    if(updateBuildScript) {
      updatePackageJsonScript(
        host, 
        `build-${name}`, 
        `ng build --prod --output-hashing none --single-bundle true && tsc -p tsconfig.${name}.json`, 
        packageJsonPath,
        true
      );

      updatePackageJsonScript(
        host, 
        "build", 
        `npm run build-${name}`, 
        packageJsonPath,
        true
      );

      updatePackageJsonSchematics(
        host,
        "./src/collection.json",
        packageJsonPath,
        true
      )
    } else {
      updatePackageJsonScript(
        host, 
        `build-${name}`, 
        `ng build --prod --output-hashing none --single-bundle true --project ${name}`, 
        packageJsonPath,
        true
      );
    }
    
    return host;
  };
}

function updateCustomElementFiles(options: ApplicationOptions, componentOptions: Partial<ComponentOptions>, appDir: string, appRootSelector: string): Rule {
  return mergeWith(
    apply(url('./custom-element-files'), [
    componentOptions.inlineTemplate ? filter(path => !path.endsWith('.html.template')) : noop(),
    componentOptions.skipTests ? filter(path => !path.endsWith('.spec.ts.template')) : noop(),
    applyTemplates({
      ...strings,
      ...options,
      selector: appRootSelector,
      ...componentOptions,
      'dot': '.',
    }),
      move(appDir),
    ]), MergeStrategy.Overwrite)
}

function updateNgAddFiles(options: ApplicationOptions, appDir: string): Rule {
  return mergeWith(
    apply(url('./ng-add-files'), [
    applyTemplates({
      ...strings,
      ...options,
    }),
      move(appDir),
    ]), MergeStrategy.Overwrite)
}

function updateApplicationFiles(options: ApplicationOptions, componentOptions: Partial<ComponentOptions>, appDir: string, appRootSelector: string): Rule {
  return (host: Tree) => {
    const routing = hasFile(host, `${appDir}/src/app/`, "app-routing.module.ts");
    
    return mergeWith(
      apply(url('./application-files'), [
      componentOptions.inlineTemplate ? filter(path => !path.endsWith('.html.template')) : noop(),
      componentOptions.skipTests ? filter(path => !path.endsWith('.spec.ts.template')) : noop(),
      applyTemplates({
        ...strings,
        ...options,
        selector: appRootSelector,
        ...componentOptions,
        routing
      }),
        move(appDir),
      ]), MergeStrategy.Overwrite);
  };
}

function updateAngularJsonBuilder(options: ApplicationOptions, angularJsonPath: string) {
  return (host: Tree) => {
    updateBuilderToNgxBuildPlus(host, angularJsonPath, strings.dasherize(options.name));

    return host;
  }
}

function updateAssetsForApplicationCustomElements(angularJsonPath: string): Rule {
  return (host: Tree) => {
    addGlobAssetForDist(host, angularJsonPath);

    return host;
  }
}

function addScriptUrlForLocalCustomElement(appModulePath: string, name: string): Rule {
  return (host: Tree) => {
    addScriptUrlToAppModule(host, appModulePath, name);

    return host;
  }
} 

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export default function(options: ApplicationOptions): Rule {
  return async (host: Tree, _context: SchematicContext) => {

    const workspace = await getWorkspace(host);
    const newProjectRoot = workspace.extensions.newProjectRoot as (string | undefined) || '';
    const isRootApp = options.projectRoot !== undefined;
    const appDir = isRootApp
      ? normalize(options.projectRoot || '')
      : join(normalize(newProjectRoot), options.name);

    const packageJsonPath = `package.json`;
    const angularJsonPath = `angular.json`;
    const appModulePath = `src/app/app.module.ts`;

    const isCustomElement = options.applicationType === ApplicationType.CustomElement ? true: false;

    const appRootSelector = `${options.prefix}-root`;
    const componentOptions: Partial<ComponentOptions> = !options.minimal ?
      {
        inlineStyle: options.inlineStyle,
        skipTests: options.skipTests,
        style: options.style,
        viewEncapsulation: options.viewEncapsulation,
      } :
      {
        inlineStyle: true,
        skipTests: true,
        style: options.style,
      };

    return chain([
      externalSchematic('@schematics/angular', 'application', { ...options, routing: isCustomElement ? false : options.routing }),
      isCustomElement ? chain([
        addCustomElementDependenciesToPackageJson(options, packageJsonPath),
        updateCustomElementsNpmScripts(packageJsonPath, strings.dasherize(options.name), options.updateBuildScript),
        updateCustomElementFiles(options, componentOptions, appDir, appRootSelector),
        options.updateBuildScript ? updateNgAddFiles(options, appDir) : addScriptUrlForLocalCustomElement(appModulePath, strings.dasherize(options.name)),
        updateAngularJsonBuilder(options, angularJsonPath)
      ]): chain([
        addApplicationDependenciesToPackageJson(options, packageJsonPath),
        updateApplicationFiles(options, componentOptions, appDir, appRootSelector),
        updateAssetsForApplicationCustomElements(angularJsonPath)
      ])
    ]);
  };
}
