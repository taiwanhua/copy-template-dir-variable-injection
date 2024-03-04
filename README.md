# copy-template-dir-variable-injection is fork from [copy-template-dir](https://github.com/yoshuawuyts/copy-template-dir)

## Why?

The template `{{ var }}` has been made customizable

High throughput template dir writes. Supports variable injection using the
mustache `{{ }}` syntax. or custom

## Installation

```sh
$ npm install copy-template-dir-variable-injection
```

## Usage

```js
const copy = require("copy-template-dir-variable-injection");
const path = require("path");

const vars = { foo: "bar" };
const inDir = path.join(process.cwd(), "templates");
const outDir = path.join(process.cwd(), "dist");

copy(inDir, outDir, vars, "{{\\s*([^{}\\s]+)\\s*}}", (err, createdFiles) => {
  if (err) throw err;
  createdFiles.forEach((filePath) => console.log(`Created ${filePath}`));
  console.log("done!");
});
```

## API

### copyTemplateDir(templateDir, targetDir, vars, pattern, cb)

Copy a directory of files over to the target directory, and inject the files
with variables. Takes the following arguments:

- **templateDir**: The directory that holds the templates. Filenames prepended
  with a `_` will have it removed when copying. Dotfiles need to be prepended
  with a `_`. Files and filenames are populated with variables using the
  `{{varName}}` syntax.
- **targetDir**: the output directory
- **vars**: An object with variables that are injected into the template files
  and file names.
- **pattern**: A custom Regex to match pattern like `{{varName}}` .
- **cb(err, createdFiles)**: A callback that is called on completion, with
  paths to created files if there were no errors.

## License

[MIT](https://tldrlegal.com/license/mit-license)
