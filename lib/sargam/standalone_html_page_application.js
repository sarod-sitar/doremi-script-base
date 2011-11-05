(function() {
  var $, root;
  $ = jQuery;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  $(document).ready(function() {
    var renderer;
    window.debug = false;
    renderer = new SargamHtmlRenderer;
    return renderer.adjust_slurs_in_dom();
  });
}).call(this);
