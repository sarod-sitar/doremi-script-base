(function() {
  var log, root;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  log = function(x) {
    var arg, _i, _len, _results;
    if (!(this.debug != null)) {
      return;
    }
    if (!this.debug) {
      return;
    }
    if (!(typeof JSON !== "undefined" && JSON !== null)) {
      return;
    }
    _results = [];
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      arg = arguments[_i];
      _results.push(console.log(JSON.stringify(arg, null, " ")));
    }
    return _results;
  };
  root.log = log;
}).call(this);
