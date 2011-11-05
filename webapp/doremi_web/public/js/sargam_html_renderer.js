(function() {
  var SargamHtmlRenderer, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  root.SargamHtmlRenderer = SargamHtmlRenderer = (function() {
    function SargamHtmlRenderer() {}
    SargamHtmlRenderer.prototype.LOOKUP = {
      "b": "&#9837;",
      "#": "&#9839;",
      ".": "&bull;",
      "*": "&bull;",
      "|:": "&#x1d106",
      "~": "&#x1D19D&#x1D19D",
      ":|": "&#x1d107",
      "|": "&#x1d100",
      "||": "&#x1d101",
      "%": "&#x1d10E",
      "|]": "&#x1d102",
      "[|": "&#x1d103"
    };
    SargamHtmlRenderer.prototype.adjust_slurs_in_dom = function() {
      return $('span[data-begin-slur-id]').each(function(index) {
        var attr, pos1, pos2, slur;
        pos2 = $(this).offset();
        attr = $(this).attr("data-begin-slur-id");
        slur = $("#" + attr);
        if (slur.length === 0) {
          return;
        }
        pos1 = $(slur).offset();
        return $(slur).css({
          width: pos2.left - pos1.left + $(this).width()
        });
      });
    };
    SargamHtmlRenderer.prototype.draw_logical_line = function(logical_line) {
      var item, x;
      x = ((function() {
        var _i, _len, _ref, _results;
        _ref = logical_line.sargam_line.items;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push(__bind(function(item) {
            return this.draw_item(item);
          }, this)(item));
        }
        return _results;
      }).call(this)).join('');
      return "<div class='stave sargam_line'>" + x + "</div>";
    };
    SargamHtmlRenderer.prototype.draw_measure = function(measure) {
      var item, x;
      x = (function() {
        var _i, _len, _ref, _results;
        _ref = measure.items;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push(__bind(function(item) {
            var val;
            if (!item.my_type) {
              return "??";
            }
            return val = this.draw_item(item);
          }, this)(item));
        }
        return _results;
      }).call(this);
      return x.join("");
    };
    SargamHtmlRenderer.prototype.draw_item = function(item) {
      var attribute, bull, data1, lower_sym, lower_sym_html, my_source, pitch_sign, syl, syl_html, upper_attributes_html, upper_sym, upper_sym_html;
      if (item.my_type === "beat") {
        return this.draw_beat(item);
      }
      if (item.my_type === "measure") {
        return this.draw_measure(item);
      }
      if (item.my_type === "begin_slur" || item.my_type === "end_slur" || item.my_type === "begin_beat" || item.my_type === "end_beat") {
        return "";
      }
      my_source = SargamHtmlRenderer.prototype.LOOKUP[item.source];
      if (!(my_source != null)) {
        my_source = item.source;
      }
      if (item.my_type === "whitespace") {
        my_source = Array(item.source.length + 1).join("&nbsp;");
      }
      pitch_sign = "";
      if (item.my_type === 'pitch') {
        my_source = item.pitch_source;
        if (my_source[1] === "#") {
          my_source = my_source[0];
          pitch_sign = "<span class='pitch_sign sharp'>" + SargamHtmlRenderer.prototype.LOOKUP['#'] + "</span>";
        }
        if (my_source[1] === "b") {
          my_source = my_source[0];
          pitch_sign = "<span class='pitch_sign flat'>" + SargamHtmlRenderer.prototype.LOOKUP['b'] + "</span>";
        }
      }
      bull = SargamHtmlRenderer.prototype.LOOKUP["."];
      upper_sym = "";
      lower_sym = "";
      if (item.octave === -1) {
        lower_sym = bull;
      }
      if (item.octave === -2) {
        lower_sym = ":";
      }
      if (item.octave === 2) {
        upper_sym = ":";
      }
      if (item.octave === 1) {
        upper_sym = bull;
      }
      lower_sym_html = "";
      if (lower_sym !== "") {
        lower_sym_html = "<span class=\"lower_octave1\">" + lower_sym + "</span>";
      }
      upper_sym_html = "";
      if (upper_sym !== "") {
        upper_sym_html = "<span class=\"upper_octave1 upper_octave_indicator\">" + upper_sym + "</span>";
      }
      syl = "";
      upper_attributes_html = "";
      if (item.syllable != null) {
        syl = item.syllable;
      }
      syl_html = "";
      if (syl !== "") {
        syl_html = "<span class=\"syllable1\">" + syl + "</span>";
      }
      data1 = "";
      if (item.attributes) {
        upper_attributes_html = ((function() {
          var _i, _len, _ref, _results;
          _ref = item.attributes;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            attribute = _ref[_i];
            _results.push(__bind(function(attribute) {
              var my_item, my_source2;
              if (attribute.my_type === "upper_octave_indicator") {
                return "";
              }
              if (attribute.my_type === "begin_slur") {
                this.id_ctr++;
                this.last_slur_id = this.id_ctr;
                return "<span id=\"" + this.id_ctr + "\" class=\"slur\">&nbsp;&nbsp;</span>";
              }
              if (attribute.my_type === "end_slur") {
                data1 = "data-begin-slur-id='" + this.last_slur_id + "'";
                return "";
              }
              my_item = attribute;
              my_source2 = SargamHtmlRenderer.prototype.LOOKUP[my_item.source];
              if (!my_source2) {
                my_source2 = my_item.source;
              }
              return "<span class=\"upper_attribute " + my_item.my_type + "\">" + my_source2 + "</span>";
            }, this)(attribute));
          }
          return _results;
        }).call(this)).join('');
      }
      return "<span class=\"note_wrapper\" " + data1 + ">" + upper_attributes_html + upper_sym_html + lower_sym_html + syl_html + "<span class=\"note " + item.my_type + "\" tabindex=\"0\">" + my_source + "</span>" + pitch_sign + "</span>";
    };
    SargamHtmlRenderer.prototype.draw_beat = function(beat) {
      var extra, item, x;
      x = 'beat here';
      x = (function() {
        var _i, _len, _ref, _results;
        _ref = beat.items;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push(__bind(function(item) {
            var val;
            if (!item.my_type) {
              return "??";
            }
            return val = this.draw_item(item);
          }, this)(item));
        }
        return _results;
      }).call(this);
      extra = "";
      if (beat.subdivisions > 1) {
        extra = "data-subdivisions=" + beat.subdivisions;
      }
      return "<span " + extra + " class='beat'>" + (x.join('')) + "</span>";
    };
    SargamHtmlRenderer.prototype.to_html = function(composition_data) {
      var attribute, attrs, logical_line, x;
      window.debug = false;
      this.id_ctr = new Date().getTime();
      attrs = '';
      if (composition_data.attributes != null) {
        attrs = ((function() {
          var _i, _len, _ref, _results;
          _ref = composition_data.attributes.items;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            attribute = _ref[_i];
            _results.push("<div class=\"attribute\"><span class=\"attribute_key\">" + attribute.key + "\n</span>:<span class=\"attribute_value\">" + attribute.value + "\n</span></div>");
          }
          return _results;
        })()).join('\n');
      }
      attrs = "<div class='attribute_section'>" + attrs + "</div>";
      x = ((function() {
        var _i, _len, _ref, _results;
        _ref = composition_data.logical_lines;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          logical_line = _ref[_i];
          _results.push(__bind(function(logical_line) {
            return this.draw_logical_line(logical_line);
          }, this)(logical_line));
        }
        return _results;
      }).call(this)).join('\n');
      return "<div class='composition_data'>" + attrs + x + "</div>";
    };
    return SargamHtmlRenderer;
  })();
}).call(this);
