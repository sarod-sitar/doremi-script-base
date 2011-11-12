(function() {
  var all_items, root, tree_each, tree_filter, tree_find, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  if (typeof require !== 'undefined') {
    _ = require("underscore")._;
  }
  tree_filter = function(tree, my_function) {
    return _.select(all_items(tree), my_function);
  };
  tree_find = function(tree, my_function) {
    return _.find(all_items(tree), my_function);
  };
  all_items = function(tree, items) {
    var an_item, _fn, _i, _len, _ref;
    if (items == null) {
      items = [];
    }
    if (!tree.items) {
      return [tree];
    }
    _ref = tree.items;
    _fn = __bind(function(an_item) {
      items.push(an_item);
      return items.concat(all_items(an_item, items));
    }, this);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      an_item = _ref[_i];
      _fn(an_item);
    }
    return [tree].concat(items);
  };
  tree_each = function(tree, fun) {};
  root.tree_each = tree_each;
  root.all_items = all_items;
  root.tree_filter = tree_filter;
  root.tree_select = tree_filter;
  root.tree_find = tree_find;
  root.tree_detect = tree_find;
}).call(this);
