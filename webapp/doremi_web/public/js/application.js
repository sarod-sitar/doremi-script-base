(function() {
  var root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  $(document).ready(function() {
    var Logger, debug, generate_html_page_aux, get_css, get_dom_fixer, get_zepto, handleFileSelect, load_filepath, parser, sample_compositions_click, setup_links, setup_samples_dropdown, setup_to_musicxml, str;
    $('.generated_by_lilypond').hide();
    Logger = _console.constructor;
    _console.level = Logger.WARN;
    _.mixin(_console.toObject());
    if (typeof Zepto !== "undefined" && Zepto !== null) {
      _.debug("***Using zepto.js instead of jQuery***");
    }
    debug = false;
    setup_to_musicxml = function() {
      var params;
      params = {
        type: 'GET',
        url: '/js/composition.mustache',
        dataType: 'txt',
        success: function(data) {
          return to_musicxml.templates.composition = _.template(data);
        }
      };
      return $.ajax(params);
    };
    setup_to_musicxml();
    setup_samples_dropdown = function() {
      var params;
      params = {
        type: 'GET',
        url: '/list_samples',
        dataType: 'json',
        success: function(data) {
          var item, str;
          str = ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              item = data[_i];
              _results.push("<option value='/samples/" + item + "'>" + item + "</option>");
            }
            return _results;
          })()).join('');
          return $('#sample_compositions').append(str);
        }
      };
      return $.ajax(params);
    };
    setup_samples_dropdown();
    if (window.location.host.indexOf('localhost') === -1) {
      $("#add_to_samples").hide();
    }
    setup_links = function(filename) {
      var full_path, snip, typ, without_suffix, _i, _len, _ref, _results;
      without_suffix = filename.substr(0, filename.lastIndexOf('.txt')) || filename;
      _ref = ["png", "pdf", "mid", "ly", "txt"];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        typ = _ref[_i];
        snip = "window.open('" + without_suffix + "." + typ + "'); return false; ";
        $("#download_" + typ).attr('href', full_path = "" + without_suffix + "." + typ);
        if (typ === 'png') {
          $('#lilypond_png').attr('src', full_path);
        }
        _results.push($("#download_" + typ).attr('onclick', snip));
      }
      return _results;
    };
    load_filepath = function(filepath) {
      var params;
      params = {
        type: 'GET',
        url: filepath,
        dataType: 'text',
        success: __bind(function(data) {
          $('#entry_area').val(data);
          $('#sample_compositions').val("Load sample compositions");
          setup_links(filepath);
          return $('.generated_by_lilypond').show();
        }, this)
      };
      return $.ajax(params);
    };
    sample_compositions_click = function() {
      if (this.selectedIndex === 0) {
        return;
      }
      return load_filepath(this.value);
    };
    $('#sample_compositions').change(sample_compositions_click);
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
    str = "C    C7\nS R- --";
    str = 'mg\n (m--D) |';
    str = '  A11 A7    Dm  Bb Dm/A       C      F           F\n              C         Gm           1_____      2______\n                *                    *           *           \n| G - G - | D N S- ND | N- -D P N | (S P m G) :| S - - -     ||\n  I said some-thing wrong now I long for  yes-ter-day day ';
    str = '  Am/D\n| S- - - -   ';
    str = '<SR>\n|  m';
    str = '     S\n|(Sr  n)';
    str = 'SRG';
    root.debug = true;
    window.timer_is_on = 0;
    if (window.location.pathname.indexOf("/samples/") > -1) {
      load_filepath("" + window.location.pathname + ".txt");
    }
    if (window.location.pathname.indexOf("/compositions/") > -1) {
      load_filepath("" + window.location.pathname + ".txt");
    }
    $('#entry_area').val(str);
    window.last_val = str;
    window.timed_count = __bind(function() {
      var cur_val, t;
      cur_val = $('#entry_area').val();
      if (window.last_val !== cur_val) {
        $('#run_parser').trigger('click');
        window.last_val = cur_val;
      }
      return t = setTimeout("timed_count()", 1000);
    }, this);
    window.do_timer = __bind(function() {
      if (!window.timer_is_on) {
        window.timer_is_on = 1;
        return window.timed_count();
      }
    }, this);
    parser = DoremiScriptParser;
    window.parse_errors = "";
    $('#show_parse_tree').click(function() {
      return $('#parse_tree').toggle();
    });
    $('#generate_staff_notation').click(__bind(function() {
      var my_data, obj;
      $('#lilypond_png').attr('src', "");
      $('.generated_by_lilypond').hide();
      my_data = {
        as_html: true,
        fname: window.the_composition.filename,
        data: window.the_composition.lilypond,
        doremi_script_source: $('#entry_area').val(),
        save_to_samples: $('#save_to_samples').val() === "on"
      };
      obj = {
        type: 'POST',
        url: '/lilypond.txt',
        data: my_data,
        error: function(some_data) {
          alert("Generating staff notation failed");
          return $('#lilypond_png').attr('src', 'none.jpg');
        },
        success: function(some_data, text_status) {
          console.log("success,fname is", some_data.fname);
          setup_links(some_data.fname);
          $('.generated_by_lilypond').show();
          $('#lilypond_output').html(some_data.lilypond_output);
          if (some_data.error) {
            return $('#lilypond_output').toggle();
          }
        },
        dataType: "json"
      };
      return $.ajax(obj);
    }, this));
    get_dom_fixer = function() {
      var params;
      params = {
        type: 'GET',
        url: '/js/dom_fixer.js',
        dataType: 'text',
        success: function(data) {
          $('#dom_fixer_for_html_doc').html(data);
          window.generate_html_doc_ctr--;
          return generate_html_page_aux();
        }
      };
      return $.ajax(params);
    };
    get_zepto = function() {
      var params;
      params = {
        type: 'GET',
        url: '/js/third_party/zepto.unminified.js',
        dataType: 'text',
        success: function(data) {
          $('#zepto_for_html_doc').html(data);
          window.generate_html_doc_ctr--;
          return generate_html_page_aux();
        }
      };
      return $.ajax(params);
    };
    get_css = function() {
      var params;
      params = {
        type: 'GET',
        url: '/css/application.css',
        dataType: 'text',
        success: function(data) {
          $('#css_for_html_doc').html(data);
          window.generate_html_doc_ctr--;
          return generate_html_page_aux();
        }
      };
      return $.ajax(params);
    };
    generate_html_page_aux = function() {
      var composition, css, full_url, html_str, js, js2, my_data, obj;
      if (window.generate_html_doc_ctr > 0) {
        return;
      }
      css = $('#css_for_html_doc').html();
      js = $('#zepto_for_html_doc').html();
      js2 = $('#dom_fixer_for_html_doc').html();
      composition = window.the_composition;
      full_url = "http://ragapedia.com";
      html_str = to_html_doc(composition, full_url, css, js + js2);
      my_data = {
        timestamp: new Date().getTime(),
        filename: composition.filename,
        html_to_use: html_str
      };
      obj = {
        type: 'POST',
        url: "/generate_html_page",
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
    };
    $('#generate_html_page').click(__bind(function() {
      var css;
      if ((css = $('#css_for_html_doc').html()).length < 100) {
        if ((window.generate_html_doc_ctr != null) && (window.generate_html_doc_ctr > 0)) {
          return;
        }
        window.generate_html_doc_ctr = 3;
        get_css();
        get_zepto();
        get_dom_fixer();
        return;
      }
      return generate_html_page_aux();
    }, this));
    $('#show_lilypond_output').click(function() {
      return $('#lilypond_output').toggle();
    });
    $('#show_lilypond_source').click(function() {
      return $('#lilypond_source').toggle();
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
        src = $('#entry_area').val();
        composition_data = parser.parse(src);
        composition_data.source = src;
        composition_data.lilypond = to_lilypond(composition_data);
        window.the_composition = composition_data;
        $('#parse_tree').text("Parsing completed with no errors \n" + JSON.stringify(composition_data, null, "  "));
        if (composition_data.warnings.length > 0) {
          $('#warnings_div').html("The following warnings were reported:<br/>" + composition_data.warnings.join('<br/>'));
          $('#warnings_div').show();
        }
        $('#parse_tree').hide();
        $('#rendered_doremi_script').html(to_html(composition_data));
        $('#lilypond_source').html(composition_data.lilypond);
        adjust_slurs_in_dom();
        return canvas = $("#rendered_in_staff_notation")[0];
      } catch (err) {
        window.parse_errors = window.parse_errors + "\n" + err;
        $('#parse_tree').text(window.parse_errors);
        $('#parse_tree').show();
        throw err;
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
