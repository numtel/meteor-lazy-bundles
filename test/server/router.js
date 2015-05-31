
// iron:router plugin must be installed
registerIRPrivateBundles();

// Initialize iron:router Plugin on server-side
Router.plugin('privateBundles', {
  // Optional: Set to true to output file load errors to console
  debug: true,
  // Optional: Route path (without leading slash), Default '_loadSource'
  route: 'authBundle', 
  // Optional: Determine if a route should serve the file requested.
  //           If not specified, all requests will be granted.
  //           ALL requests granted means that your private directory would
  //            not be private any more!
  //   @context - Same as Router.route context
  //   @param {string} path - Filename requested
  //   @return boolean - true to serve file, false to serve nothing
  allow: function(path){ 
    // Sample authentication scheme
    // Require query parameter 'allow' to have value 'yes'
    return this.params.query.allow === 'yes';
  }
});
