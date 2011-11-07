(function() {
  var $, root;
  $ = jQuery;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  $(document).ready(function() {
    window.debug = false;
    return adjust_slurs_in_dom();
  });
}).call(this);
