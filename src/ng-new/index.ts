/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  chain,
  empty,
  mergeWith,
  move,
  noop,
  schematic,
} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
  NodePackageLinkTask,
  RepositoryInitializerTask,
} from '@angular-devkit/schematics/tasks';
import { Schema as ApplicationOptions } from '../application/schema';
import { validateProjectName } from '@schematics/angular/utility/validation';
import { Schema as WorkspaceOptions } from '../workspace/schema';
import { Schema as NgNewOptions, ApplicationType } from './schema';


export default function(options: NgNewOptions): Rule {
  if (!options.name) {
    throw new SchematicsException(`Invalid options, "name" is required.`);
  }

  validateProjectName(options.name);

  if (!options.directory) {
    options.directory = options.name;
  }

  const isCustomElement = options.applicationType === ApplicationType.CustomElement ? true: false;

  const workspaceOptions: WorkspaceOptions = {
    name: options.name,
    version: options.version,
    newProjectRoot: options.newProjectRoot,
    minimal: options.minimal,
    strict: options.strict,
    packageManager: options.packageManager,
  };
  
  const applicationOptions: ApplicationOptions = {
    projectRoot: '',
    name: options.name,
    inlineStyle: options.inlineStyle,
    inlineTemplate: options.inlineTemplate,
    prefix: options.prefix,
    viewEncapsulation: options.viewEncapsulation,
    routing: isCustomElement ? false : undefined,
    style: options.style,
    skipTests: options.skipTests,
    skipPackageJson: false,
    // always 'skipInstall' here, so that we do it after the move
    skipInstall: true,
    strict: options.strict,
    minimal: options.minimal,
    legacyBrowsers: options.legacyBrowsers,
    applicationType: options.applicationType,
    updateBuildScript: true
  };

  return chain([
    mergeWith(
      apply(empty(), [
        schematic('workspace', workspaceOptions),
        options.createApplication ? schematic('application', applicationOptions) : noop,
        move(options.directory),
      ]),
    ),
    (_host: Tree, context: SchematicContext) => {
      let packageTask;
      if (!options.skipInstall) {
        packageTask = context.addTask(
          new NodePackageInstallTask({
            workingDirectory: options.directory,
            packageManager: options.packageManager,
          }),
        );
        if (options.linkCli) {
          packageTask = context.addTask(
            new NodePackageLinkTask('@angular/cli', options.directory),
            [packageTask],
          );
        }
      }
      if (!options.skipGit) {
        const commit = typeof options.commit == 'object'
          ? options.commit
          : (!!options.commit ? {} : false);

        context.addTask(
          new RepositoryInitializerTask(
            options.directory,
            commit,
          ),
          packageTask ? [packageTask] : [],
        );
      }
    },
  ]);
}