(function() {
  var Logger, debug, parser, root, sys, test_data, test_to_lilypond, to_lilypond, utils, _;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  debug = false;
  if (typeof global !== "undefined" && global !== null) {
    global._console || (global._console = require('./underscore.logger.js'));
  }
  Logger = global._console.constructor;
  if (typeof require !== "undefined" && require !== null) {
    _ = require("underscore")._;
  }
  require('./doremi_script_parser.js');
  sys = require('sys');
  utils = require('./tree_iterators.js');
  _console.level = Logger.WARN;
  _.mixin(_console.toObject());
  _.mixin({
  each_slice: function(obj, slice_size, iterator, context) {
    var collection = obj.map(function(item) { return item; });
    
    if (typeof collection.slice !== 'undefined') {
      for (var i = 0, s = Math.ceil(collection.length/slice_size); i < s; i++) {
        iterator.call(context, _(collection).slice(i*slice_size, (i*slice_size)+slice_size), obj);
      }
    }
    return; 
  }
});;
  to_lilypond = require('./to_lilypond.js').to_lilypond;
  parser = DoremiScriptParser;
  test_to_lilypond = function(str, test, msg) {
    var composition, lily;
    if (msg == null) {
      msg = "";
    }
    composition = parser.parse(str);
    _.debug("test_to_lilypond:composition is " + composition);
    composition.source = str;
    _.debug("test_to_lilypond, str is \n" + str + "\n");
    lily = to_lilypond(composition);
    composition.lilypond = lily;
    _.debug("test_to_lilypond returned \n" + lily + "\n");
    return lily;
  };
  test_data = ["S - -", "c'4~ c'4~ c'4", "DOESNT combine whole empty beat within a measure", "S -- ---------", "c'4~ c'4~ c'4", "DOESNT should combine whole empty beat within a measure", "1#2#3#4#5#6#7#-   1b2b3b4b5b6b7b- 1234567-", "cs'32 ds'32 es'32 fs'32 gs'32 as'32 bs'16 cf'32 df'32 ef'32 ff'32 gf'32 af'32 bf'16 c'32 d'32 e'32 f'32 g'32 a'32 b'16", "should work with number notation", "| S-RG | ---- -SRS", "e'4", "2nd measure should have tied e4", " PmPm\n|    P", "\\acciaccatura {g'32[ f'32 g'32 f'32]}g'4", "ornaments"];
  exports.test_all = function(test) {
    var fun;
    console.log("test_all");
    fun = function(args) {
      var expected, lily, msg, str;
      str = args[0], expected = args[1], msg = args[2];
      lily = test_to_lilypond(str, test);
      _.warn("Testing " + str + " -> " + expected);
      return test.ok(lily.indexOf(expected) > -1, "FAILED*** " + msg + ". Expected output of " + str + " to include " + expected + ". Output was \n\n" + lily + "\n\n");
    };
    _.each_slice(test_data, 3, fun);
    return test.done();
  };
}).call(this);
