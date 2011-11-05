(function() {
  var log;
  exports.test_john = function(test) {
    test.ok(true, "should pass");
    return test.done();
  };
  log = function(x) {
    return console.log(x);
  };
}).call(this);
