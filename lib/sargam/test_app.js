(function() {
  var $, root;
  $ = jQuery;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  $(document).ready(function() {
    var debug, h, obj, parser, renderer, str, strs, _i, _len, _results;
    parser = SargamParser;
    renderer = new SargamHtmlRenderer;
    debug = false;
    strs = [" \n.. ....\nSS SSSS SS SS |\n        .. ..", 'Rag:Bhairavi\nTal:Tintal\nTitle:Bansuri\nSource:AAK\nMode: phrygian\n           . .\n[| Srgm PdnS SndP mgrS |]\n\n           I  IV            V   V7 ii    iii7 \n               3                  +            2          .\n1)|: S S S (Sr | n) S   (gm Pd) | P - P  P   | P - D  <(nDSn)>) |\n                 .\n            ban-    su-  ri       ba- ja ra-   hi  dhu- na\n\n  0  ~                3               ~       +  .     *  *   \n| P  d   P       d    |  (Pm   PmnP) (g m) | (PdnS) -- g  S |\n     ma- dhu-ra  kan-     nai-        ya      khe-     la-ta\n\n    2              0     \n                   ~\n| (d-Pm  g) P  m | r - S :|\n   ga-      wa-ta  ho- ri\n'];
    strs = [strs[1]];
    _results = [];
    for (_i = 0, _len = strs.length; _i < _len; _i++) {
      str = strs[_i];
      _results.push((function() {
        try {
          $('#test_results').append("<h4>Source:</h4><pre class='show_sargam_source'>" + str + "</pre>");
          obj = parser.parse(str);
          h = renderer.to_html(obj);
          $('#test_results').append("<h4>Rendered html</h4><div class='rendered_html'>" + h + "</div>");
          return renderer.adjust_slurs_in_dom();
        } catch (err) {
          return console.log(err);
        }
      })());
    }
    return _results;
  });
}).call(this);
