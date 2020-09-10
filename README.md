# Angular Schematics - Custom Elements

This is a Schematic implementation used to create Angular applications that support [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

## Setup
To use this Schematic implementation for development, run the following:

```bash
npm install @ngce/schematics
```

At the core, the library will create standard Angular applications and, as such, will allow you to specify the same flags when running `ng new application` using the `@schematics/angular` implementation.  The `@ngce/schematics` implementation, however, provides an additional `--applicationType` option to allow a developer to create either a custom element workspace or a custom element consuming application.  

## Create a Custom Element
To create a new Angular workspace implementing a custom element called `custom-element`, run the following command:

```bash
ng new --collection=@ngce/schematics --applicationType=customElement custom-element
```

All custom elements must follow the format of:

```typescript
/^([A-Za-z0-9]*)([\-A-Za-z0-9])*$/g
```

Custom element workspaces that do not follow this pattern will require additional configuration.

To publish the custom element, run the following:

```bash
npm run build
npm publish
```

Alternatively, you can run the following command, which will create a `custom-element-0.0.0.tgz` file:

```bash
npm run build
npm pack
```
 
## Consume Custom Elements
To create a new Angular application equipped to consume and use custom elements called `custom-elements-app`, run the following command:

```bash
ng new --collection=@ngce/schematics --applicationType=application custom-elements-app
```

To install the `custom-element` package described above once it has been published, run the following command:

```bash
ng add custom-element
```

Alternatively, you can move `custom-element-0.0.0.tgz`, described above, into the top directory of `custom-elements-app` and install the package using the following command:

```bash
ng add custom-element-0.0.0.tgz
```

Once the custom element has successfully been added, you can use the custom element within your HTML using the following tag:

```html
<custom-element></custom-element>
```

## Add Custom Elements To An Existing Application

If you want to add a custom element application called `example-element` to an existing workspace, you can run the following command:

```bash
ng generate @ngce/schematics:application --applicationType=customElement example-element
```

You can then build the custom element by using a command that follows the pattern `npm run build-<custom_element_name>`:

```bash
npm run build-example-element
```

To make the new custom element accessible to `custom-elements-app`, add the following to the `projects.custom-elements-app.architect.build.options.assets` array of your `angular.json` file:


```typescript
{
    "glob": "**/*",
    "input": "./dist",
    "output": "./dist"
}
```

Additionally, add a script URL to the `scriptUrls` constant in the `src/app/app.module.ts` file of `custom-elements-app`:

```typescript
const scriptUrls = ["/dist/example-element/main.js"];
```