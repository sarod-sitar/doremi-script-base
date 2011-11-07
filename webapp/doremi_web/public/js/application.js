(function() {
  var $, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $ = jQuery;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  $(document).ready(function() {
    var debug, handleFileSelect, long_composition, my_url, params_for_download_lilypond, params_for_download_sargam, parser, renderer, str, str1, str_simple, zlong_composition;
    debug = false;
    handleFileSelect = __bind(function(evt) {
      var file, reader;
      file = document.getElementById('file').files[0];
      reader = new FileReader();
      reader.onload = function(evt) {
        $('#entry_area').val(evt.target.result);
        return $('#lilypond_png').attr('src', "");
      };
      return reader.readAsText(file, "");
    }, this);
    document.getElementById('file').addEventListener('change', handleFileSelect, false);
    root.debug = true;
    window.timer_is_on = 0;
    window.last_val = str;
    window.timed_count = __bind(function() {
      var cur_val, t;
      cur_val = $('#entry_area').val();
      if (window.last_val !== cur_val) {
        $('#run_parser').trigger('click');
      }
      return t = setTimeout("timed_count()", 1000);
    }, this);
    window.do_timer = __bind(function() {
      if (!window.timer_is_on) {
        window.timer_is_on = 1;
        return window.timed_count();
      }
    }, this);
    long_composition = '\nRag:Bhairavi\nTal:Tintal\nTitle:Bansuri\nAuthor:Traditional\nSource:AAK\nMode: phrygian\nFilename: bansuri.sargam\nTime: 4/4\nKey: d\n\n\n          \n                            i            IV\n         3                  +            2          .\n1)|: (Sr | n) S   (gm Pd) | P - P  P   | P - D  <(nDSn)>) |\n           .\n      ban-    su-  ri       ba- ja ra-   hi  dhu- na\n\n  0  ~                3            ~       +  .     *  *   \n| P  d   P    d    |  (Pm   PmnP) (g m) | (PdnS) -- g  S |\n  ma-dhu-ra   kan-     nai-        ya      khe-     la-ta\n\n   2               0     \n                   ~\n| (d-Pm  g) P  m | r - S :|\n   ga-      wa-ta  ho- ri';
    zlong_composition = 'Rag:Bhairavi\nTal:Tintal\nTitle:Bansuri\nSource:AAK\nMode: phrygian\n           . .\n[| Srgm PdnS SndP mgrS |]\n\n           I  IV            V   V7 ii    iii7 \n               3                  +            2          .\n1)|: S S S (Sr | n) S   (gm Pd) | P - P  P   | P - D  <(nDSn)>) |\n                 .\n            ban-    su-  ri       ba- ja ra-   hi  dhu- na\n\n  0  ~                3               ~       +  .     *  *   \n| P  d   P       d    |  (Pm   PmnP) (g m) | (PdnS) -- g  S |\n     ma- dhu-ra  kan-     nai-        ya      khe-     la-ta\n\n    2              0     \n                   ~\n| (d-Pm  g) P  m | r - S :|\n   ga-      wa-ta  ho- ri\n';
    str = "S";
    str1 = '                          I   IV       V   V7 ii  iii7 \n       3                  +            2          .\n|: (Sr | n) S   (gm Pd) | P - P  P   | P - D  (<nDSn>) |\n         .\n    ban-    su-  ri       ba- ja ra-   hi  dhu- na\n\n  0  ~                3           ~       +  .     *  .\n| P  d   P   d    |  (Pm   PmnP) (g m) | (PdnS) -- g  S |\n  ma-dhu-ra  kan-     nai-        ya      khe-     la-ta';
    str = '    I                       IV             V\n                 .  .   .    . ..\n|: (SNRSNS) N    S--S --S- | SNRS N D P || mm GG RR S-SS :|  \n    .   .   .\n    he-     llo';
    str = 'Rag:Bhairavi\nTal:Tintal\nTitle:Bansuri\nSource:AAK\n\n          3             ~    +            2         .\n1) |: (Sr | n) S   (gm Pd)|| P - P  P   | P - D  (<nDSn>) |\n            .\n       ban-    su-  ri       ba- ja ra-   hi  dhu- na\n\n0                 3                    +     .    *  .\n| P  d   P   d    | <(Pm>   PmnP) (g m)|| PdnS -- g  S |\n  ma-dhu-ra  kan-     nai-         ya     khe-    la-ta\n\n2              0     ~\n|  d-Pm g P  m | r - S :|\n   ga-    wa-ta  ho- ri\n\n      I                     IV\n              . .                   . .\n2)  [| Srgm PdnS SndP mgrS | Srgm PdnS SndP mgrS | % | % |]';
    str_simple = '   + \n   .                        .\n|<(S--  r)>  (r---  g-m) | (Sn-d    Pmg rS) - - |\n   test-ing   looped-       melisma-';
    str = str1;
    str = "S--R --G- | -m-- P";
    $('#entry_area').val(str_simple);
    parser = SargamParser;
    renderer = new SargamHtmlRenderer;
    window.parse_errors = "";
    params_for_download_lilypond = {
      filename: function() {
        return "" + window.the_composition.filename + ".ly";
      },
      data: function() {
        return window.the_composition.lilypond;
      },
      swf: 'js/third_party/downloadify/media/downloadify.swf',
      downloadImage: 'images/download.png',
      height: 21,
      width: 76,
      transparent: false,
      append: false,
      onComplete: function() {
        return alert("Your file was saved");
      }
    };
    params_for_download_sargam = _.clone(params_for_download_lilypond);
    params_for_download_sargam.data = function() {
      return $('#entry_area').val();
    };
    params_for_download_sargam.filename = function() {
      return "" + window.the_composition.filename + "_sargam.txt";
    };
    $("#download_lilypond_source").downloadify(params_for_download_lilypond);
    $("#download_sargam_source").downloadify(params_for_download_sargam);
    $('#load_long_composition').click(function() {
      return $('#entry_area').val(long_composition);
    });
    $('#load_sample_composition').click(function() {
      return $('#entry_area').val(str);
    });
    $('#show_parse_tree').click(function() {
      return $('#parse_tree').toggle();
    });
    my_url = "lilypond.txt";
    $('#generate_staff_notation').click(__bind(function() {
      var my_data, obj;
      $('#lilypond_png').attr('src', "");
      my_data = {
        fname: window.the_composition.filename,
        data: window.the_composition.lilypond,
        sargam_source: $('#entry_area').val()
      };
      obj = {
        type: 'POST',
        url: my_url,
        data: my_data,
        error: function(some_data) {
          alert("Generating staff notation failed");
          return $('#lilypond_png').attr('src', 'none.jpg');
        },
        success: function(some_data, text_status) {
          var destination, fooOffset, snip, typ, _i, _len, _ref;
          $('#play_midi').attr('src', some_data.midi);
          window.the_composition.midi = some_data.midi;
          _ref = ["png", "pdf", "midi", "ly", "txt"];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            typ = _ref[_i];
            snip = "window.open('compositions/" + some_data.fname + "." + typ + "'); return false; ";
            $("#download_" + typ).attr('href', "compositions/" + some_data.fname + "." + typ);
            $("#download_" + typ).attr('onclick', snip);
          }
          $('#lilypond_png').attr('src', some_data.png);
          if (true) {
            fooOffset = $('#lilypond_png').offset();
            destination = fooOffset.top;
            $(document).scrollTop(destination);
            window.location = String(window.location).replace(/\#.*$/, "") + "#staff_notation";
          }
          $('#lilypond_output').html(some_data.lilypond_output);
          if (some_data.error) {
            return $('#lilypond_output').toggle();
          }
        },
        dataType: "json"
      };
      return $.ajax(obj);
    }, this));
    $('#generate_html_page').click(__bind(function() {
      var composition, full_url, my_data, obj, rendered_composition, tmpl;
      my_url = "generate_html_page";
      composition = window.the_composition;
      rendered_composition = renderer.to_html(composition);
      full_url = "http://ragapedia.com";
      tmpl = "<html>\n  <head>\n    <title>" + composition.title + "</title>\n    <link media=\"all\" type=\"text/css\" href=\"" + full_url + "/css/application.css\" rel=\"stylesheet\">\n    <meta content=\"text/html;charset=utf-8\" http-equiv=\"Content-Type\">\n  </head>\n<body>\n  <div id=\"rendered_sargam\">\n    " + rendered_composition + "\n  </div>\n    <!-- all this is needed for adjust_parens method call -->\n    <script type=\"text/javascript\" src=\"" + full_url + "/js/third_party/jquery.js\"></script>\n    <script type=\"text/javascript\" src=\"" + full_url + "/js/third_party/underscore.js\"></script>\n    <script type=\"text/javascript\" src=\"" + full_url + "/js/sargam_html_renderer.js\"></script>\n    <script type=\"text/javascript\" src=\"" + full_url + "/js/standalone_html_page_application.js\"></script>\n</body>\n</html>";
      my_data = {
        timestamp: new Date().getTime(),
        filename: composition.filename,
        html_to_use: tmpl
      };
      obj = {
        type: 'POST',
        url: my_url,
        data: my_data,
        error: function(some_data) {
          return alert("Create html page failed, some_data is " + some_data);
        },
        success: function(some_data, text_status) {
          return window.open("compositions/" + some_data);
        },
        dataType: "text"
      };
      return $.ajax(obj);
    }, this));
    $('#show_lilypond_output').click(function() {
      return $('#lilypond_output').toggle();
    });
    $('#show_lilypond_source').click(function() {
      return $('#lilypond_source').toggle();
    });
    $('#lilypond_output').click(function() {});
    $('#lilypond_source').click(function() {
      if (parser.is_parsing) {}
    });
    $('#run_parser').click(function() {
      var canvas, composition_data, src;
      if (parser.is_parsing) {
        return;
      }
      window.parse_errors = "";
      $('#parse_tree').text('parsing...');
      try {
        $('#warnings_div').hide();
        $('#warnings_div').html("");
        parser.is_parsing = true;
        composition_data = parser.parse((src = $('#entry_area').val()));
        composition_data.source = src;
        composition_data.lilypond = to_lilypond(composition_data);
        window.the_composition = composition_data;
        $('#parse_tree').text("Parsing completed with no errors \n" + JSON.stringify(composition_data, null, "  "));
        if (composition_data.warnings.length > 0) {
          $('#warnings_div').html("The following warnings were reported:<br/>" + composition_data.warnings.join('<br/>'));
          $('#warnings_div').show();
        }
        $('#parse_tree').hide();
        $('#rendered_sargam').html(renderer.to_html(composition_data));
        $('#lilypond_source').html(composition_data.lilypond);
        renderer.adjust_slurs_in_dom();
        if (false) {
          $('span[data-begin-slur-id]').each(function(index) {
            var attr, pos1, pos2, slur;
            pos2 = $(this).offset();
            attr = $(this).attr("data-begin-slur-id");
            slur = $("#" + attr);
            pos1 = $(slur).offset();
            return $(slur).css({
              width: pos2.left - pos1.left + $(this).width()
            });
          });
        }
        return canvas = $("#rendered_in_staff_notation")[0];
      } catch (err) {
        window.parse_errors = window.parse_errors + "\n" + err;
        $('#parse_tree').text(window.parse_errors);
        return $('#parse_tree').show();
      } finally {
        window.last_val = $('#entry_area').val();
        parser.is_parsing = false;
      }
    });
    $('#run_parser').trigger('click');
    $('#parse_tree').hide();
    $('#lilypond_output').hide();
    $('#lilypond_source').hide();
    return window.do_timer();
  });
}).call(this);
