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

function syncJax(href){
  var request = new XMLHttpRequest();
  request.open('GET', href, false);
  request.send(null);
  return request.responseText;
}

var allStatus = [];
for(var file in cases) {
  var content = syncJax(file);
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

Template.results.helpers({
  status: function() { return allStatus }
});
