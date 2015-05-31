# numtel:lazy-bundles

By default, Meteor does not perform any special handling on files placed inside the `public` and `private` directories of your application.

With this package, you can place `xxx.publicbundles.json` or `xxx.privatebundles.json` files in your application directory with a description of bundles of source files to process for client-side lazy-loading.

Source files will be transpiled and collected into a single `.js` and `.css` file for each bundle.

## Installation

```
meteor add numtel:lazy-bundles
```

## Public Bundle Descriptions

Inside of a `xxx.publicbundles.json` file in the root of your application, you may describe bundles of source files to serve to the client. The filename may be different than `xxx.publicbundles.json` as long as it includes the extension `.publicbundles.json`. (e.g. `myapp.publicbundles.json` is also valid)

Filenames specified inside of each bundle are relative to the application's `public` directory.

The following example will serve `admin.js`, `admin.js.map`, `admin.css`, and `admin.css.map`:

```javascript
{
  "admin": [ 
    "admin/templates.html",
    "admin/styles.less",
    "admin/main.coffee"
  ]
}
```

* Listed filenames may be glob patterns in order to include multiple files without manually specifying each filename, as defined by [`glob` NPM package](https://github.com/isaacs/node-glob). See [`test/test-glob.publicbundles.json`](test/test-glob.publicbundles.json) for an example using a glob.
* Bundle names may contain slashes to simulate a directory path
* `.html` files are automatically sorted to the beginning of a bundle but other template filetypes are not. Be sure to include template files like `.jade` first in the bundle so that subsequent scripts will have access to apply helpers, events and handlers.

## Private Bundle Descriptions

Private bundles may be specified exactly the same as public bundles except with the `.privatebundles.json` extension.

Filenames specified inside of each private bundle are relative to the application's `private` directory.

To obtain asset data directly from your application's server code, you may use the built-in method, `Assets.getText()`. Otherwise, load the files using the provided `iron:router` plugin described below.

## Minified Output

For production output, bundles may be minified using the available setting.

See [`test/test-minified.publicbundles.json`](test/test-minified.publicbundles.json) for a minified bundle example.

## Iron Router integration

Combine with the [`miro:preloader` package](https://github.com/MiroHibler/meteor-preloader) to dynamically load the bundled `.js` and `.css` files when browsing to a route

```javascript
// Route example using miro:preloader
Router.route('/', function () {
  this.render('hello');
}, {
  controller: 'PreloadController',
  preload: {
    styles: 'hello.css',
    sync: 'hello.js'
  }
});
```

### Private bundle authentication plugin

Private bundles can be loaded on the client using the provided `iron:router` plugin.

See [`test/server/router.js`](test/server/router.js) for an example of how to configure the authentication plugin.

## Notes

* If adding a new source handler package (e.g. `mquandalle:jade`), you must restart Meteor for this package to recognize the change.
* If using a glob, Meteor must be restarted to search for new/deleted files.

## Test application

Test cases for this package are not executed using the normal `meteor test-packages` command. Instead, start the Meteor app inside of the `test` directory and see the status in the browser.

```bash
$ git clone https://github.com/numtel/meteor-lazy-bundles

$ cd meteor-lazy-bundles/test

$ meteor

# Open browser to http://localhost:3000/ to view test results
```

Test cases are described in [`test/client/index.js`](test/client/index.js).

## License

MIT

Portions copyright Maxime Quandalle @mquandalle
