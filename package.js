Package.describe({
  name: 'numtel:lazy-bundles',
  summary: 'Create bundles for lazy-loading components, optionally with authentication',
  version: '1.0.1',
  git: 'https://github.com/numtel/meteor-lazy-bundles.git'
});

Package.registerBuildPlugin({
  name: 'compileBundles',
  use: [ 'underscore@1.0.3' ],
  sources: [
    'plugin/compile-bundles.js'
  ],
  npmDependencies: {
    'glob': '5.0.10'
  }
});

Package.onUse(function(api){
  api.versionsFrom('1.0.2.1');
  api.addFiles('private-bundle-plugin.js', 'server');
  api.export('registerIRPrivateBundles', 'server');
});
