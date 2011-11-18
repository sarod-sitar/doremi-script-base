(function() {
  var all_items_in_line, beat_is_all_dashes, calculate_lilypond_duration, debug, emit_tied_array, extract_lyrics, fraction_to_lilypond, get_attribute, is_sargam_line, is_valid_key, lilypond_barline_map, lilypond_octave_map, lilypond_pitch_map, log, my_inspect, normalized_pitch_to_lilypond, notation_is_in_sargam, root, running_under_node, to_lilypond;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  debug = true;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  is_valid_key = function(str) {
    var ary;
    ary = ["c", "d", "e", "f", "g", "a", "b", "cs", "df", "ds", "ef", "fs", "gb", "gs", "ab", "as", "bf"];
    return _.indexOf(ary, str) > -1;
  };
  extract_lyrics = function(composition_data) {
    var ary, item, sargam_line, _i, _j, _len, _len2, _ref, _ref2;
    ary = [];
    _ref = composition_data.lines;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sargam_line = _ref[_i];
      _ref2 = all_items_in_line(sargam_line, []);
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
  get_attribute = function(composition_data, key) {
    var att;
    if (!composition_data.attributes) {
      return null;
    }
    att = _.detect(composition_data.attributes.items, function(item) {
      return item.key === key;
    });
    if (!att) {
      return null;
    }
    return att.value;
  };
  log = function(x) {
    if (!(this.debug != null)) {
      return;
    }
    if (!this.debug) {
      return;
    }
    if (console) {
      return console.log.apply(console, arguments);
    }
  };
  running_under_node = function() {
    return (typeof module !== "undefined" && module !== null) && module.exports;
  };
  my_inspect = function(obj) {
    if (!(debug != null)) {
      return;
    }
    if (!debug) {
      return;
    }
    if (!(typeof console !== "undefined" && console !== null)) {
      return;
    }
    if (running_under_node()) {
      console.log(sys.inspect(obj, false, null));
      return;
    }
    return console.log(obj);
  };
  fraction_to_lilypond = {
    "2/1": "2",
    "3/1": "2.",
    "4/1": "1",
    "5/1": "1..",
    "1/1": "4",
    "1/1": "4",
    "1/1": "4",
    "1/1": "4",
    "1/2": "8",
    "1/3": "8",
    "1/9": "8",
    "1/11": "8",
    "1/13": "8",
    "1/5": "16",
    "2/5": "8",
    "3/5": "8.",
    "4/5": "4",
    "5/5": 4,
    "6/6": 4,
    "7/7": 4,
    "8/8": 4,
    "9/9": 4,
    "10/10": 4,
    "11/11": 4,
    "12/12": 4,
    "13/13": 4,
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
  calculate_lilypond_duration = function(numerator, denominator) {
    var alternate, frac, looked_up_duration;
    if (numerator === denominator) {
      return "4";
    }
    frac = "" + numerator + "/" + denominator;
    looked_up_duration = fraction_to_lilypond[frac];
    if (!(looked_up_duration != null)) {
      alternate = "16";
      return alternate;
    }
    return looked_up_duration;
  };
  normalized_pitch_to_lilypond = function(pitch) {
    var begin_slur, duration, e, end_slur, ending, first_fraction, mordent, o, p, t;
    ending = "";
    if (pitch.attributes) {
      if (e = _.detect(pitch.attributes, function(x) {
        return x.my_type === "ending";
      })) {
        ending = "^\"" + e.source + "\"";
      }
    }
    if (pitch.fraction_array != null) {
      first_fraction = pitch.fraction_array[0];
    } else {
      first_fraction = new Fraction(pitch.numerator, pitch.denominator);
    }
    duration = calculate_lilypond_duration(first_fraction.numerator.toString(), first_fraction.denominator.toString());
    this.log("normalized_pitch_to_lilypond, pitch is", pitch);
    if (pitch.my_type === "dash") {
      return "r" + duration + ending;
    }
    p = lilypond_pitch_map[pitch.normalized_pitch];
    if (!(p != null)) {
      return "???" + pitch.source;
    }
    o = lilypond_octave_map["" + pitch.octave];
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
    if (item_has_attribute(pitch, "begin_slur")) {
      begin_slur = "(";
    }
    if (item_has_attribute(pitch, "end_slur")) {
      end_slur = ")";
    }
    t = "";
    if (pitch.tied != null) {
      t = '~';
    }
    return "" + p + o + duration + t + mordent + begin_slur + end_slur + ending;
  };
  lilypond_barline_map = {
    "reverse_final_barline": '\\bar "|."',
    "final_barline": '\\bar "||"',
    "double_barline": '\\bar "||" ',
    "single_barline": '\\bar "|" ',
    "left_repeat": '\\bar "|:" ',
    "right_repeat": '\\bar ":|" '
  };
  lilypond_octave_map = {
    "-2": ",",
    "-1": "",
    "0": "'",
    "1": "'" + "'",
    "2": "'" + "'" + "'"
  };
  lilypond_pitch_map = {
    "-": "r",
    "C": "c",
    "C#": "cs",
    "Cb": "cf",
    "Db": "df",
    "D": "d",
    "D#": "ds",
    "Eb": "ef",
    "E": "e",
    "E#": "es",
    "F": "f",
    "F#": "fs",
    "Gb": "gf",
    "G": "g",
    "G#": "gs",
    "Ab": "af",
    "A": "a",
    "A#": "as",
    "Bb": "bf",
    "B": "b",
    "B#": "bs"
  };
  emit_tied_array = function(last_pitch, tied_array, ary) {
    var filter, fraction_total, key, last, my_fun, my_funct, obj;
    if (!(last_pitch != null)) {
      return;
    }
    if (tied_array.length === 0) {
      return;
    }
    my_funct = function(memo, my_item) {
      var frac;
      frac = new Fraction(my_item.numerator, my_item.denominator);
      if (!(memo != null)) {
        return frac;
      } else {
        return frac.add(memo);
      }
    };
    fraction_total = _.reduce(tied_array, my_funct, null);
    obj = {};
    for (key in last_pitch) {
      obj[key] = last_pitch[key];
    }
    filter = function(attr) {
      return (attr.my_type != null) && attr.my_type === !"mordent";
    };
    obj.attributes = _.select(last_pitch.attributes, filter);
    obj.numerator = fraction_total.numerator;
    obj.denominator = fraction_total.denominator;
    obj.fraction_array = null;
    my_fun = function(attr) {
      return attr.my_type === !"mordent";
    };
    obj.attrs2 = _.select(obj.attributes, my_fun);
    this.log("emit_tied_array-last is", last);
    last = tied_array[tied_array.length - 1];
    obj.tied = last.tied;
    this.log("leaving emit_tied_array");
    tied_array.length = 0;
    return ary.push(normalized_pitch_to_lilypond(obj));
  };
  is_sargam_line = function(line) {
    if (!(line.kind != null)) {
      return false;
    }
    return line.kind.indexOf('sargam') > -1;
  };
  notation_is_in_sargam = function(composition_data) {
    this.log("in notation_is_in_sargam");
    return _.detect(composition_data.lines, function(line) {
      return is_sargam_line(line);
    });
  };
  beat_is_all_dashes = function(beat) {
    var fun, x;
    x = all_items_in_line(beat);
    fun = function(item) {
      if (!(item.my_type != null)) {
        return true;
      }
      if (item.my_type === "pitch") {
        return false;
      }
    };
    return _.all(beat, fun);
  };
  to_lilypond = function(composition_data) {
    var all, ary, at_beginning_of_first_measure_of_line, bar, beat, composer, composer_snippet, dash, dashes_at_beginning_of_line_array, in_times, item, key_is_valid, key_snippet, last_pitch, lilypond_template, line, measure, mode, my_mode, notes, obj, orig, src, src1, tied_array, time, title, title_snippet, transpose_snip, x, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
    ary = [];
    in_times = false;
    at_beginning_of_first_measure_of_line = false;
    dashes_at_beginning_of_line_array = [];
    tied_array = [];
    _ref = composition_data.lines;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      at_beginning_of_first_measure_of_line = false;
      in_times = false;
      this.log("processing " + line.source);
      all = [];
      x = all_items_in_line(line, all);
      this.log("in to_lilypond, all_items_in_line x=", x);
      last_pitch = null;
      for (_j = 0, _len2 = all.length; _j < _len2; _j++) {
        item = all[_j];
        if (((_ref2 = item.my_type) === "pitch" || _ref2 === "barline" || _ref2 === "measure") || item.is_barline) {
          if (tied_array.length > 0) {
            emit_tied_array(last_pitch, tied_array, ary);
          }
        }
        if (in_times) {
          if (item.my_type === "beat" || item.my_type === "barline") {
            ary.push("}");
            in_times = false;
          }
        }
        this.log("processing " + item.source + ", my_type is " + item.my_type);
        if (item.my_type === "pitch") {
          last_pitch = item;
          if (dashes_at_beginning_of_line_array.length > 0) {
            for (_k = 0, _len3 = dashes_at_beginning_of_line_array.length; _k < _len3; _k++) {
              dash = dashes_at_beginning_of_line_array[_k];
              ary.push(normalized_pitch_to_lilypond(dash));
            }
            dashes_at_beginning_of_line_array = [];
          }
          if (item.my_type === "pitch") {
            ary.push(normalized_pitch_to_lilypond(item));
          }
        }
        bar = '\\bar "|" ';
        if (item.is_barline) {
          x = lilypond_barline_map[item.my_type];
          if (!(x != null)) {
            x = bar;
          }
          x = ary.push(x);
        }
        if (item.my_type === "beat") {
          beat = item;
          if (((_ref3 = beat.subdivisions) !== 0 && _ref3 !== 1 && _ref3 !== 2 && _ref3 !== 4 && _ref3 !== 8 && _ref3 !== 16 && _ref3 !== 32 && _ref3 !== 64 && _ref3 !== 128) && !beat_is_all_dashes(beat)) {
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
        if (item.my_type === "dash") {
          if (!item.dash_to_tie && (item.numerator != null)) {
            this.log("pushing item onto dashes_at_beginning_of_line_array");
            dashes_at_beginning_of_line_array.push(item);
          }
        }
        if (item.my_type === "measure") {
          measure = item;
          if (measure.is_partial) {
            ary.push("\\partial 4*" + measure.beat_count + " ");
          }
        }
        if (item.dash_to_tie) {
          tied_array.push(item);
          if (false) {
            this.log("item.dash_to_tie case, item is", item);
            orig = item.pitch_to_use_for_tie;
            while (orig.pitch_to_use_for_tie) {
              orig = orig.pitch_to_use_for_tie;
            }
            this.log("dash_to_tie, orig is", orig);
            obj = {
              source: orig.source,
              normalized_pitch: orig.normalized_pitch,
              octave: orig.octave,
              numerator: item.numerator,
              denominator: item.denominator,
              tied: item.tied
            };
            this.log("dash_to_tie case");
            ary.push(normalized_pitch_to_lilypond(obj));
          }
        }
      }
      if (in_times) {
        ary.push("}");
        in_times = false;
      }
      if (tied_array.length > 0) {
        emit_tied_array(last_pitch, tied_array, ary);
      }
      ary.push("\\break\n");
    }
    mode = "major";
    my_mode = get_attribute(composition_data, 'Mode');
    if (my_mode) {
      mode = my_mode;
    }
    composer = get_attribute(composition_data, "Author");
    composer_snippet = "";
    if (composer) {
      composer_snippet = "composer = \"" + composer + "\"";
    }
    title = get_attribute(composition_data, "Title");
    time = get_attribute(composition_data, "TimeSignature");
    if ((key_is_valid = is_valid_key(composition_data.key))) {
      transpose_snip = "\\transpose c' " + composition_data.key + "'";
    } else {
      transpose_snip = "";
      if (composition_data.key != null) {
        this.log("" + composition_data.key + " is invalid");
        composition_data.warnings.push("Invalid key. Valid keys are cdefgab etc. Use a Mode: directive to set the mode(major,minor,aeolian, etc). See the lilypond documentation for more info");
      }
    }
    if (!notation_is_in_sargam(composition_data)) {
      transpose_snip = "";
    }
    if (!time) {
      time = "4/4";
    }
    key_snippet = "\\key c \\" + mode;
    if (!notation_is_in_sargam(composition_data) && key_is_valid) {
      key_snippet = "\\key " + composition_data.key + " \\" + mode;
    }
    title_snippet = "";
    if (title) {
      title_snippet = "title = \"" + title + "\"";
    }
    notes = ary.join(" ");
    if (!(composition_data.source != null)) {
      composition_data.source = "";
    }
    src1 = composition_data.source.replace(/%\{/gi, "% {");
    src = src1.replace(/\{%/gi, "% }");
    lilypond_template = "#(ly:set-option 'midi-extension \"mid\")\n\\version \"2.12.3\"\n\\include \"english.ly\"\n\\header{ " + title_snippet + " " + composer_snippet + " }\n\\include \"english.ly\"\n%{\n" + src + "  \n%}\nmelody = {\n\\clef treble\n" + key_snippet + "\n\\time " + time + "\n\\autoBeamOn  \n" + notes + "\n}\n\ntext = \\lyricmode {\n" + (extract_lyrics(composition_data).join(' ')) + "\n}\n\n\\score{\n" + transpose_snip + "\n<<\n\\new Voice = \"one\" {\n  \\melody\n}\n\\new Lyrics \\lyricsto \"one\" \\text\n>>\n\\layout { }\n\\midi { }\n}";
    return lilypond_template;
  };
  all_items_in_line = function(line_or_item, items) {
    var an_item, _fn, _i, _len, _ref;
    if (items == null) {
      items = [];
    }
    if (!line_or_item.items) {
      return [line_or_item];
    }
    _ref = line_or_item.items;
    _fn = __bind(function(an_item) {
      items.push(an_item);
      return items.concat(all_items_in_line(an_item, items));
    }, this);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      an_item = _ref[_i];
      _fn(an_item);
    }
    this.log('all_items_in_line returns', items);
    return [line_or_item].concat(items);
  };
  root.to_lilypond = to_lilypond;
}).call(this);
