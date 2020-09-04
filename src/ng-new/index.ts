import {
//  JsonObject,
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
import { Rule, SchematicContext, Tree, chain, externalSchematic } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { Schema as NgNewOptions, ApplicationType } from './schema';
import { Schema as ComponentOptions } from '@schematics/angular/component/schema';
import { updateScript } from '../utility/npm-scripts';
import { hasFile } from '../utility/find-file';

function addCustomElementDependenciesToPackageJson(options: NgNewOptions, packageJsonPath: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    [
      {
        type: NodeDependencyType.Default,
        name: '@angular/elements',
        version: "latest",
      },
      {
        type: NodeDependencyType.Default,
        name: 'concat',
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

function addApplicationDependenciesToPackageJson(options: NgNewOptions, packageJsonPath: string): Rule {
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

function updateCustomElementsNpmScripts(packageJsonPath: string): Rule {
  return (host: Tree) => {
    updateScript(
      host, 
      "build", 
      "ng build --prod --output-hashing none && concat -o dist/plugin.js dist/custom-element/runtime.js dist/custom-element/polyfills.js dist/custom-element/main.js", 
      packageJsonPath,
      true
    );
    
    return host;
  };
}

function updateCustomElementFiles(options: NgNewOptions, componentOptions: Partial<ComponentOptions>, appDir: string, appRootSelector: string): Rule {
  return mergeWith(
    apply(url('./custom-element-files'), [
    componentOptions.inlineTemplate ? filter(path => !path.endsWith('.html.template')) : noop(),
    componentOptions.skipTests ? filter(path => !path.endsWith('.spec.ts.template')) : noop(),
    applyTemplates({
      utils: strings,
      ...options,
      selector: appRootSelector,
      ...componentOptions,
    }),
      move(appDir),
    ]), MergeStrategy.Overwrite)
}

function updateApplicationFiles(options: NgNewOptions, componentOptions: Partial<ComponentOptions>, appDir: string, appRootSelector: string): Rule {
  return (host: Tree) => {
    const routing = hasFile(host, `${appDir}/src/app/`, "app-routing.module.ts");
    
    return mergeWith(
      apply(url('./application-files'), [
      componentOptions.inlineTemplate ? filter(path => !path.endsWith('.html.template')) : noop(),
      componentOptions.skipTests ? filter(path => !path.endsWith('.spec.ts.template')) : noop(),
      applyTemplates({
        utils: strings,
        ...options,
        selector: appRootSelector,
        ...componentOptions,
        routing
      }),
        move(appDir),
      ]), MergeStrategy.Overwrite);
  };
}


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export default function(options: NgNewOptions): Rule {
  return async (_tree: Tree, _context: SchematicContext) => {

    const newProjectRoot = '';
    const appDir = join(normalize(newProjectRoot), options.name);
    const packageJsonPath = `${appDir}/package.json`;

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
      isCustomElement ? chain([
        externalSchematic('@schematics/angular', 'ng-new', {
          name: options.name,
          routing: false,
          commit: options.commit,
          createApplication: options.createApplication,
          directory: options.directory,
          inlineStyle: options.inlineStyle,
          inlineTemplate: options.inlineTemplate,
          linkCli: options.linkCli,
          minimal: options.minimal,
          newProjectRoot: options.newProjectRoot,
          packageManager: options.packageManager,
          prefix: options.prefix,
          strict: options.strict,
          style: options.style,
          viewEncapsulation: options.viewEncapsulation,
          version: options.version,
          skipTests: options.skipTests,
          skipInstall: options.skipInstall,
          skipGit: options.skipGit
        }),
        addCustomElementDependenciesToPackageJson(options, packageJsonPath),
        updateCustomElementsNpmScripts(packageJsonPath),
        updateCustomElementFiles(options, componentOptions, appDir, appRootSelector)
      ]): chain([
        externalSchematic('@schematics/angular', 'ng-new', {
          name: options.name,
          commit: options.commit,
          createApplication: options.createApplication,
          directory: options.directory,
          inlineStyle: options.inlineStyle,
          inlineTemplate: options.inlineTemplate,
          linkCli: options.linkCli,
          minimal: options.minimal,
          newProjectRoot: options.newProjectRoot,
          packageManager: options.packageManager,
          prefix: options.prefix,
          strict: options.strict,
          style: options.style,
          viewEncapsulation: options.viewEncapsulation,
          version: options.version,
          skipTests: options.skipTests,
          skipInstall: options.skipInstall,
          skipGit: options.skipGit
        }),
        addApplicationDependenciesToPackageJson(options, packageJsonPath),
        updateApplicationFiles(options, componentOptions, appDir, appRootSelector)
      ])
    ]);
  };
}
