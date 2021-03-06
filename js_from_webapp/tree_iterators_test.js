(function() {
  var all_items, debug, log, my_log, root, tree_select, util, x;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  debug = false;
  util = require('util');
  all_items = require('./all_items.js').all_items;
  log = function(x) {
    if (!console) {
      return;
    }
    if (debug) {
      return console.log(x);
    }
  };
  x = require('./tree_iterators.js');
  tree_select = x.tree_select;
  my_log = function(obj) {
    return util.inspect(obj, true, null);
  };
  exports.test_tree_select = function(test) {
    var result, tree;
    tree = {
      my_type: "line",
      line_number: 1,
      items: [
        {
          my_type: "pitch",
          pitch: "C"
        }, {
          my_type: "pitch",
          pitch: "D"
        }
      ]
    };
    result = tree_select(tree, function(item) {
      return item.my_type === "pitch";
    });
    test.equal(2, result.length);
    return test.done();
  };
  exports.test_tree_map = function(test) {
    var result, tree;
    tree = {
      my_type: "line",
      line_number: 1,
      items: [
        {
          my_type: "pitch",
          pitch: "C"
        }, {
          my_type: "pitch",
          pitch: "D"
        }
      ]
    };
    result = tree_select(tree, function(item) {
      return item.my_type === "pitch";
    });
    test.equal(2, result.length);
    return test.done();
  };
  exports.test_empty_object = function(test) {
    var result;
    result = all_items({});
    test.equal(1, result.length);
    return test.done();
  };
  exports.test_object_with_items = function(test) {
    var result, tree;
    tree = {
      my_type: "line",
      line_number: 1,
      items: [
        {
          my_type: "pitch",
          pitch: "C"
        }, {
          my_type: "pitch",
          pitch: "D"
        }
      ]
    };
    result = all_items(tree);
    test.equal(3, result.length);
    test.equal(result[0].my_type, "line");
    return test.done();
  };
}).call(this);
