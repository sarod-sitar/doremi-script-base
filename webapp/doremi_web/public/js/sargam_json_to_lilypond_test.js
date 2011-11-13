(function() {
  var debug, log, parser, root, sys, to_lilypond, utils;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  debug = false;
  log = function(x) {
    if (!console) {
      return;
    }
    if (debug) {
      return console.log(x);
    }
  };
  sys = require('sys');
  utils = require('./tree_iterators.js');
  require('./sargam_parser.js');
  to_lilypond = require('./sargam_json_to_lilypond.js').to_lilypond;
  parser = SargamParser;
  exports.test_ = function(test) {
    var str;
    str = ':';
    test.equal(1, 1);
    return test.done();
  };
}).call(this);
