(function() {
  /*
    sargam_json_to_lilypond.to_lilypond 
    -- Take in json structure representing a composition and 
            return lilypond 
  */
  var SargamJsonToLilypond, debug, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  debug = false;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  root.SargamJsonToLilypond = (SargamJsonToLilypond = (function() {
    function SargamJsonToLilypond(composition_data) {
      this.composition_data = composition_data;
    }
    SargamJsonToLilypond.prototype.extract_lyrics = function() {
      var ary, item, logical_line, _i, _j, _len, _len2, _ref, _ref2;
      ary = [];
      _ref = this.composition_data.logical_lines;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        logical_line = _ref[_i];
        _ref2 = this.all_items_in_line(logical_line.sargam_line, []);
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          item = _ref2[_j];
          this.log("extract_lyrics-item is", item);
          if (item.syllable) {
            ary.push(item.syllable);
          }
        }
      }
      return ary;
    };
    SargamJsonToLilypond.prototype.get_attribute = function(key) {
      var att;
      if (!this.composition_data.attributes) {
        return null;
      }
      att = _.detect(this.composition_data.attributes.items, function(item) {
        return item.key === key;
      });
      if (!att) {
        return null;
      }
      return att.value;
    };
    SargamJsonToLilypond.prototype.log = function(x) {
      if (!(this.debug != null)) {
        return;
      }
      if (!this.debug) {
        return;
      }
      if (console) {
        return console.log(x);
      }
    };
    SargamJsonToLilypond.prototype.running_under_node = function() {
      return (typeof module !== "undefined" && module !== null) && module.exports;
    };
    SargamJsonToLilypond.prototype.my_inspect = function(obj) {
      if (!(debug != null)) {
        return;
      }
      if (!debug) {
        return;
      }
      if (this.running_under_node()) {
        console.log(sys.inspect(obj, false, null));
        return;
      }
      return console.log(obj);
    };
    SargamJsonToLilypond.prototype.fraction_to_lilypond = {
      "1/1": "4",
      "1/2": "8",
      "1/3": "8",
      "1/9": "8",
      "1/11": "8",
      "1/13": "8",
      "1/5": "16",
      "1/7": "32",
      "2/7": "16",
      "3/7": "16.",
      "4/7": "8",
      "5/7": "8..",
      "6/7": "8..",
      "6/8": "8.",
      "2/3": "4",
      "2/8": "16",
      "3/8": "16.",
      "5/8": "8",
      "4/8": "8",
      "7/8": "8..",
      "1/6": "16",
      "2/6": "8",
      "3/6": "4",
      "4/6": "4",
      "5/6": "8..",
      "2/2": "4",
      "3/3": "4",
      "4/4": "4",
      "8/8": "4",
      "1/4": "16",
      "2/4": "8",
      "3/4": "8.",
      "3/8": "16.",
      "4/16": "16",
      "3/16": "",
      "1/8": "32",
      "3/8": "16.",
      "6/16": "16"
    };
    SargamJsonToLilypond.prototype.pitch_to_lilypond = function(pitch) {
      var begin_slur, end_slur, frac, mordent, o, p, r, t;
      this.log("pitch_to_lilypond, pitch is", pitch);
      p = this.lilypond_pitch_map[pitch.pitch_source];
      if (!(p != null)) {
        return "???" + pitch.source;
      }
      o = this.lilypond_octave_map["" + pitch.octave];
      if (!(o != null)) {
        return "???" + pitch.octave;
      }
      begin_slur = "";
      mordent = "";
      if (pitch.attributes) {
        if (_.detect(pitch.attributes, function(x) {
          return x.my_type === "mordent";
        })) {
          mordent = "\\mordent";
        }
      }
      end_slur = "";
      if (pitch.begin_slur) {
        begin_slur = "(";
      }
      if (pitch.end_slur) {
        end_slur = ")";
      }
      t = "";
      if (pitch.tied != null) {
        t = '~';
      }
      frac = "" + pitch.numerator + "/" + pitch.denominator;
      r = this.fraction_to_lilypond[frac];
      if (!(r != null)) {
        return "???" + frac;
      }
      return "" + p + o + r + t + mordent + begin_slur + end_slur;
    };
    SargamJsonToLilypond.prototype.lilypond_octave_map = {
      "-2": ",",
      "-1": "",
      "0": "'",
      "1": "'" + "'",
      "2": "'" + "'" + "'"
    };
    SargamJsonToLilypond.prototype.lilypond_pitch_map = {
      "S": "c",
      "r": "df",
      "R": "d",
      "g": "ef",
      "G": "e",
      "m": "f",
      "M": "fs",
      "P": "g",
      "d": "af",
      "D": "a",
      "n": "bf",
      "N": "b"
    };
    SargamJsonToLilypond.prototype.to_lilypond = function() {
      var all, ary, bar, beat, composer, composer_snippet, in_times, item, latest, logical_line, measure, mode, my_mode, notes, obj, orig, part2, time, title, title_snippet, transpose, transpose_snip, valid_keys, x, _i, _j, _len, _len2, _ref, _ref2;
      ary = [];
      in_times = false;
      _ref = this.composition_data.logical_lines;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        logical_line = _ref[_i];
        in_times = false;
        this.log("processing " + logical_line.sargam_line.source);
        all = [];
        x = this.all_items_in_line(logical_line.sargam_line, all);
        this.log("in to_lilypond, x=", x);
        for (_j = 0, _len2 = all.length; _j < _len2; _j++) {
          item = all[_j];
          if (in_times) {
            if (item.my_type === "beat" || item.my_type === "barline") {
              ary.push("}");
              in_times = false;
            }
          }
          this.log("processing " + item.source + ", my_type is " + item.my_type);
          if (item.my_type === "pitch") {
            ary.push(this.pitch_to_lilypond(item));
          }
          bar = '\\bar "|" ';
          bar = '|';
          if (item.is_barline) {
            ary.push(bar);
          }
          if (item.my_type === "beat") {
            beat = item;
            if ((_ref2 = beat.subdivisions) !== 0 && _ref2 !== 1 && _ref2 !== 2 && _ref2 !== 4 && _ref2 !== 8 && _ref2 !== 16 && _ref2 !== 32 && _ref2 !== 64 && _ref2 !== 128) {
              this.log("odd beat.subdivisions=", beat.subdivisions);
              x = 2;
              if (beat.subdivisions === 6) {
                x = 4;
              }
              if (beat.subdivisions === 5) {
                x = 4;
              }
              ary.push("\\times " + x + "/" + beat.subdivisions + " { ");
              in_times = true;
            }
          }
          if (item.my_type === "measure") {
            measure = item;
            if (measure.is_partial) {
              ary.push("\\partial 4*" + measure.beat_count + " ");
            }
          }
          if (item.dash_to_tie) {
            this.log("item.dash_to_tie case, item is", item);
            orig = item.pitch_to_use_for_tie;
            while (orig.pitch_to_use_for_tie) {
              orig = orig.pitch_to_use_for_tie;
            }
            this.log("dash_to_tie, orig is", orig);
            obj = {
              source: orig.source,
              pitch_source: orig.pitch_source,
              octave: orig.octave,
              numerator: item.numerator,
              denominator: item.denominator,
              tied: item.tied
            };
            this.log("dash_to_tie case");
            ary.push(this.pitch_to_lilypond(obj));
          }
        }
        if (in_times) {
          ary.push("}");
          in_times = false;
        }
        ary.push("\\break\n");
      }
      part2 = '\n';
      mode = "major";
      my_mode = this.get_attribute('Mode');
      if (my_mode) {
        mode = my_mode;
      }
      composer = this.get_attribute("Author");
      composer_snippet = "";
      if (composer) {
        composer_snippet = "composer = \"" + composer + "\"";
      }
      title = this.get_attribute("Title");
      time = this.get_attribute("Time Signature");
      transpose = this.get_attribute("Key");
      this.log('transpose', transpose);
      transpose_snip = "";
      valid_keys = ["c", "d", "e", "f", "g", "a", "b", "cs", "df", "ds", "ef", "fs", "gb", "gs", "ab", "as", "bf"];
      if (transpose) {
        if (_.detect(valid_keys, function(x) {
          return x === transpose;
        })) {
          transpose_snip = "\\transpose c' " + transpose + "'";
        } else {
          this.log("" + transpose + " not supported as key for lilypond");
        }
      }
      if (!time) {
        time = "4/4";
      }
      title_snippet = "";
      if (title) {
        title_snippet = "title = \"" + title + "\"";
      }
      notes = ary.join(" ");
      latest = "\\include \"english.ly\"\n    \\header{ " + title_snippet + " " + composer_snippet + " }\n    \\include \"english.ly\"\n\nmelody = {\n  \\clef treble\n  \\key c \\" + mode + "\n  \\time " + time + "\n  \n  " + notes + "\n}\n\ntext = \\lyricmode {\n    " + (this.extract_lyrics(this.composition_data).join(' ')) + "\n}\n\n\\score{\n  " + transpose_snip + "\n  <<\n    \\new Voice = \"one\" {\n      \\melody\n    }\n    \\new Lyrics \\lyricsto \"one\" \\text\n  >>\n  \\layout { }\n  \\midi { }\n}";
      return latest;
    };
    SargamJsonToLilypond.prototype.all_items_in_line = function(line_or_item, items) {
      var an_item, _fn, _i, _len, _ref;
      if (!line_or_item.items) {
        return [line_or_item];
      }
      _ref = line_or_item.items;
      _fn = __bind(function(an_item) {
        items.push(an_item);
        return items.concat(this.all_items_in_line(an_item, items));
      }, this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        an_item = _ref[_i];
        _fn(an_item);
      }
      this.log('all_items_in_line returns', items);
      return [line_or_item].concat(items);
    };
    return SargamJsonToLilypond;
  })());
}).call(this);
