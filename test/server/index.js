var cases = {
  'public-bundle-test.js': [
    /class="horses"/, // From public/mockup.html
    /console.log\('horses'\)/, // From compiled version of public/mockup.coffee
  ],
  'public-bundle-test.css': [
    /color: red/, // From compiled version of public/mockup.less
  ],
  'authBundle?allow=yes&f=private-bundle-test.js': [
    /class="cheese"/, // From private/mockup.html
    /console.log\('cheese'\)/, // From compiled version of private/mockup.coffee
  ],
  'authBundle?allow=yes&f=private-bundle-test.css': [
    /color: orange/, // From compiled version of private/mockup.less
  ],
  'public-minified-test.js': [
    // Check for contents without newlines
    /function\(\)\{return HTML.Raw\('/,
    /class="horses"/,
    /function\(\)\{return console.log\("horses"\)\}\}/
  ],
  'public-minified-test.css': [
    // Check for contents without newlines
    /h1.horses\{color:red\}/
  ],
  'public-glob-test.js': [
    /console.log\('something'\)/, // From public/globber/anything.js
  ]
};

function performTests() {
  var allStatus = [];
  for(var file in cases) {
    try {
      var content = HTTP.get(Meteor.absoluteUrl(file)).content;
    } catch (err) {
      throw new Meteor.error(500, err);
    }
    var caseStatus = {
      file: file,
      passed: 0,
      count: cases[file].length,
      result: null
    };

    for(var i = 0; i < cases[file].length; i++) {
      if(content.match(cases[file][i]) !== null) {
        caseStatus.passed++;
      }
    }

    caseStatus.result = caseStatus.passed === caseStatus.count ? 'pass' : 'fail';

    allStatus.push(caseStatus);
  }

  return allStatus;
}

Meteor.startup(function() {
  // Give a few seconds for the server to be ready
  Meteor.setTimeout(function() {
    var allPass = true;

    performTests().forEach(function(result) {
      console.log(result.file.bold);
      if(result.result === 'pass') {
        console.log((result.count + ' Passed!').green);
      } else {
        allPass = false;
        console.log((result.passed + ' / ' + result.count + ' passed').red);
      }
    });

    console.log(('\n' + (allPass ? 'All tests pass!' : 'Test Failure')).bold);

    if('RUN_ONCE' in process.env) {
      Meteor.setTimeout(function() {
        process.kill(process.env.METEOR_PARENT_PID, 'SIGINT');
      }, 1000);
    }

  }, 1000);
});

