(function() {
  var debug, log, parser, root, sys, test_parses, to_lilypond, utils;
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
  log = require('./log.js').log;
  require('./sargam_parser.js');
  to_lilypond = require('./sargam_json_to_lilypond.js').to_lilypond;
  parser = SargamParser;
  test_parses = function(str, test, msg) {
    var composition;
    if (msg == null) {
      msg = "";
    }
    composition = parser.parse(str);
    if (composition != null) {
      log(composition);
    }
    test.ok(composition != null, "" + str + " didn't parse!!. " + msg);
    return composition;
  };
  exports.test_combines_whole_beat_rests_within_a_measure = function(test) {
    var composition, str;
    debug = true;
    str = 'S - -';
    composition = test_parses(str, test);
    log("composition is", composition, debug);
    return test.done();
  };
}).call(this);
