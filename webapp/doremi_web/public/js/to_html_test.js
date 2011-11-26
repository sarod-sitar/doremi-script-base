(function() {
  var Logger, debug, long_sample, parser, root, sys, test_to_html, to_html, utils, _;
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
  _console.level = Logger.ERROR;
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
  to_html = require('./html_renderer.js').to_html;
  parser = DoremiScriptParser;
  test_to_html = function(str, test, msg) {
    var composition, html;
    if (msg == null) {
      msg = "";
    }
    composition = parser.parse(str);
    _.debug("test_to_html:composition is " + composition);
    composition.source = str;
    _.debug("test_to_html, str is \n" + str + "\n");
    html = to_html(composition);
    _.debug("test_to_html returned \n" + html + "\n");
    return html;
  };
  long_sample = "Rag:Bhairavi\nTal:Tintal\nTitle:Bansuri\nAuthor:Traditional\nSource:AAK\nMode: phrygian\nFilename: bansuri.sargam\nTime: 4/4\nKey: d\n\n\n          \n                              i            IV         . \n         3                    +             2        DSnDn\n1)|: (Sr | n) S   (gm <Pd)> | P - P  P   | P - D    n     |\n           .\n      ban-    su-  ri         ba- ja ra-   hi  dhu- na\n\n  0  ~                 3           mgm        +  .     *  *   \n| P  d   P    d    |  (Pm   PmnP)    (g m) | (PdnS) -- g  S |\n  ma-dhu-ra   kan-     nai-           ya      khe-     la-ta\n\n   2               0     \n                   ~\n| (d-Pm  g) P  m | r - S :|\n   ga-      wa-ta  ho- ri\n";
  exports.test_long_sample = function(test) {
    var html;
    html = test_to_html(long_sample, test);
    test.ok(html.indexOf("note_wrapper") > -1, "failure");
    return test.done();
  };
}).call(this);
