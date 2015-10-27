// numtel:lazy-bundles
// MIT License, ben@latenightsketches.com

var fs = Npm.require('fs');
var path = Npm.require('path');
var glob = Npm.require('glob');

// With the NPM dependency (glob), cannot simply require files from
//  meteor/tools directory because the Npm.require root directory has changed
var toolDir = path.dirname(process.mainModule.filename);
// Assume never more than 100 directories deep
var rootRelPath = _.range(100).map(function() { return '..' }).join('/');
// Determine meteor/tools relative directory path
var relToolDir = path.join(rootRelPath, toolDir);

function requireMeteorTool(file) {
  return Npm.require(path.join(relToolDir, file + '.js'))
}
console.log('tooolasdf', toolDir);
// Load required meteor build tools
var compiler             = requireMeteorTool('isobuild/compiler');
var isopackets           = requireMeteorTool('isobuild/isopack');
var projectContextModule = requireMeteorTool('project-context');
var PackageSource        = requireMeteorTool('isobuild/package-source');

// Obtain array of loaded packages to make build plugins available to bundles
var loadedPackages = [];
if(process.publicsourcesProjectContext){
  var projectContext = process.publicsourcesProjectContext;
}else{
  var projectContext = new projectContextModule.ProjectContext({
    projectDir: process.cwd()
  });
  process.publicsourcesProjectContext = projectContext;
  projectContext.prepareProjectForBuild();
}
if(projectContext.isopackCache !== null) {
  for(var packageName in projectContext.isopackCache._isopacks){
    loadedPackages.push(packageName);
  }
}

// Begin code borrowed from mquandalle:bower/plugin/handler.js
function loadJSONContent(compileStep, content) {
  try {
    return JSON.parse(content);
  } catch (e) {
    compileStep.error({
      message: "Syntax error in " + compileStep.inputPath,
      line: e.line,
      column: e.column
    });
  }
}
// End code from mquandalle:bower

function isHtmlExt(n){ return n.substr(-5).toLowerCase() === '.html' }
// Used with Array.prototype.sort() in array of filenames to put '.html' first
function sortHTMLFirst(a, b){
  var aHtml = isHtmlExt(a);
  var bHtml = isHtmlExt(b);
  if(aHtml && bHtml) return 0;
  else if(aHtml) return -1;
  else if(bHtml) return 1;
  return 0;
}

function generateBundleHandler(relativeRootPath) {
  return function(compileStep, bundles){

    var bundles =
      loadJSONContent(compileStep, compileStep.read().toString('utf8'));

    // Default settings
    var minify = false;

    // Settings provided in bundle description file
    if('#settings' in bundles) {
      minify = minify || bundles['#settings'].minify;

      delete bundles['#settings'];
    }

    for(var name in bundles) {
      var prefixLength = path.join(process.cwd(), relativeRootPath).length + 1;
      // Load list of all files included in this bundle, expanding globs
      var bundleSources = _.flatten(bundles[name].map(function(pattern) {
        return glob.sync(path.join(process.cwd(), relativeRootPath, pattern));
      })).map(function(file) {
        return file.substr(prefixLength);
      }).sort(sortHTMLFirst);

      var packageSource = new PackageSource;
      packageSource.initFromOptions('resources', {
        kind: 'plugin',
        sourceRoot: path.join(process.cwd(), relativeRootPath),
        serveRoot: process.cwd(),
        use: loadedPackages,
        npmDependencies: [],
        npmDir: path.join(process.cwd(), 'node_modules'),
        sources: bundleSources
      });
      // initFromOptions() defaults to 'os' architecture
      packageSource.architectures[0].arch = 'web.browser';

      var compiled = compiler.compile(packageSource, {
        packageMap: projectContext.packageMap,
        isopackCache: projectContext.isopackCache,
        includeCordovaUnibuild: false
      });
//       }).unibuilds[0];
      console.log('compuled', name, compiled.unibuilds[0]);
      compiled.saveToPath(path.join(process.cwd(), 'public'), {
//         includeIsopackBuildInfo: true
      });



      var scripts = compiled.prelinkFiles;
      var styleSheets = compiled.resources.filter(function(resource) {
        return resource.type === 'css';
      });

      if(minify) {
        var minifiers = isopackets.load('minifiers').minifiers;
        scripts.forEach(function(jsFile) {
          var result = minifiers.UglifyJS.minify(jsFile.source, {
            fromString: true
          });

          // Replace original source with minified source
          jsFile.source = result.code;
          delete jsFile.sourceMap;
        });

        styleSheets.forEach(function(styleSheet) {
          var result =
            minifiers.CssTools.minifyCss(styleSheet.data.toString());

          // Replace original source with minified source
          styleSheet.data = new Buffer(result);
          delete styleSheet.sourceMap;
        });
      }
      
      // Handle scripts
      scripts.forEach(function(script) {
        compileStep.addAsset({
          path: name + '.js',
          data: script.source
        });
        if(script.sourceMap) {
          compileStep.addAsset({
            path: name + '.js.map',
            data: script.sourceMap.replace(script.servePath, name + '.js')
          });
        }
      });

      // Handle stylesheets
      styleSheets.forEach(function(stylesheet) {
        compileStep.addAsset({
          path: name + '.css',
          data: stylesheet.data
        });
        if(stylesheet.sourceMap) {
          compileStep.addAsset({
            path: name + '.css.map',
            data: stylesheet.sourceMap.replace(
              stylesheet.servePath, name + '.css')
          });
        }
      });
    }
  }
}

Plugin.registerSourceHandler(
  'publicbundles.json',
  { archMatching: 'web' },
  generateBundleHandler('public')
);

Plugin.registerSourceHandler(
  'privatebundles.json',
  { archMatching: 'os' },
  generateBundleHandler('private')
);

