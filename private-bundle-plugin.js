// numtel:lazy-bundles
// MIT License, ben@latenightsketches.com
var path = Npm.require('path');
var fs = Npm.require('fs');

var BASE_DIR = 'assets/app';

// Provide iron:router plugin for loading private bundles with an
// authentication lamdba function
// Call this function to install the 'privateBundles' plugin
// Not installed by default, just in case a different router is used.
registerIRPrivateBundles = function() {
  Iron.Router.plugins.privateBundles = function (router, options) {
    options = options || {};
    var route = '/' + (options.route || '_loadSource');
    router.route(route, function(){
      var query = this.params.query;
      var filename = path.join(BASE_DIR, query.f);
      if(filename.substr(0, BASE_DIR.length) !== BASE_DIR){
        // Security breach trying to access file outside of BASE_DIR
        this.response.end();
      }else if(options.allow && !options.allow.call(this, query.f)){
        this.response.end();
      }else{
        fs.readFile(filename, function(err, data){
          if(err){
            options.debug && console.log(err);
            this.response.end();
          }else{
            this.response.end(data);
          }
        }.bind(this));
      }
    }, { where: 'server' });
  }
}
