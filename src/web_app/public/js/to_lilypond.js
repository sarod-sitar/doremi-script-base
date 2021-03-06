(function() {
  var beat_is_all_dashes, calculate_lilypond_duration, debug, emit_tied_array, extract_lyrics, fraction_to_lilypond, get_attribute, get_chord, get_ending, get_ornament, has_after_ornament, has_mordent, is_sargam_line, lilypond_grace_note_pitch, lilypond_grace_notes, lilypond_octave_map, lilypond_pitch_map, lilypond_transpose, line_to_lilypond, line_to_lilypond_array, log, lookup_lilypond_barline, lookup_lilypond_pitch, my_inspect, normalized_pitch_to_lilypond, notation_is_in_sargam, root, running_under_node, shared, to_lilypond;
  debug = true;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  if (typeof require !== "undefined" && require !== null) {
    shared = require('./shared.js');
    root._ = require("underscore")._;
    root._.extend(root, shared);
  }
  extract_lyrics = function(composition_data) {
    var ary, item, sargam_line, _i, _j, _len, _len2, _ref, _ref2;
    ary = [];
    _ref = composition_data.lines;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sargam_line = _ref[_i];
      _ref2 = root.all_items(sargam_line, []);
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
    att = root._.detect(composition_data.attributes.items, function(item) {
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
      console.log(util.inspect(obj, false, null));
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
  get_ornament = function(pitch) {
    if (!(pitch.attributes != null)) {
      return false;
    }
    return root._.detect(pitch.attributes, function(attribute) {
      return attribute.my_type === "ornament";
    });
  };
  has_mordent = function(pitch) {
    if (!(pitch.attributes != null)) {
      return false;
    }
    return root._.detect(pitch.attributes, function(attribute) {
      return attribute.my_type === "mordent";
    });
  };
  lookup_lilypond_pitch = function(pitch) {
    return lilypond_pitch_map[pitch.normalized_pitch];
  };
  lilypond_grace_note_pitch = function(pitch) {
    var duration, lilypond_octave, lilypond_pitch;
    duration = "32";
    lilypond_pitch = lookup_lilypond_pitch(pitch);
    lilypond_octave = lilypond_octave_map["" + pitch.octave];
    if (!(lilypond_octave != null)) {
      return "???" + pitch.octave;
    }
    return "" + lilypond_pitch + lilypond_octave + duration;
  };
  lilypond_grace_notes = function(ornament, suppress_slurs) {
    var ary, begin_beam, begin_slur, end_beam, end_slur, length, needs_beam, pitch;
    if (suppress_slurs == null) {
      suppress_slurs = true;
    }
    ary = (function() {
      var _i, _len, _ref, _results;
      _ref = ornament.ornament_items;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pitch = _ref[_i];
        _results.push(lilypond_grace_note_pitch(pitch));
      }
      return _results;
    })();
    needs_beam = ary.length > 1;
    begin_beam = end_beam = "";
    begin_slur = "(";
    begin_slur = "";
    end_slur = ")";
    if (suppress_slurs) {
      begin_slur = "";
      end_slur = "";
    }
    if (needs_beam) {
      begin_beam = "[";
      end_beam = "]";
    }
    ary[0] = "" + ary[0] + begin_slur + begin_beam;
    length = ary.length;
    ary[length - 1] = "" + ary[length - 1] + end_slur + end_beam;
    return ary.join(' ');
  };
  get_chord = function(item) {
    var e;
    if (e = root._.detect(item.attributes, function(x) {
      return x.my_type === "chord_symbol";
    })) {
      return "^\"" + e.source + "\"";
    }
    return "";
  };
  get_ending = function(item) {
    var e;
    if (e = root._.detect(item.attributes, function(x) {
      return x.my_type === "ending";
    })) {
      return "^\"" + e.source + "\"";
    }
    return "";
  };
  normalized_pitch_to_lilypond = function(pitch, context) {
    var EXAMPLES, begin_slur, chord, duration, end_slur, ending, extra_end_slur, first_fraction, grace1, grace2, grace_notes, in_slur, lilypond_octave, lilypond_pitch, lilypond_symbol_for_tie, mordent, ornament, special_case, suppress_slurs;
    if (context == null) {
      context = {
        last_pitch: {},
        in_slur: false
      };
    }
    special_case = false;
    if (pitch.dash_to_tie && has_after_ornament(context.last_pitch)) {
      if (false) {
        console.log("***SPECIAL CASE");
      }
      special_case = true;
    }
    if (false) {
      console.log("context.in_slur is ", context.in_slur);
    }
    chord = get_chord(pitch);
    ending = get_ending(pitch);
    if (pitch.fraction_array != null) {
      first_fraction = pitch.fraction_array[0];
    } else {
      first_fraction = new Fraction(pitch.numerator, pitch.denominator);
    }
    duration = calculate_lilypond_duration(first_fraction.numerator.toString(), first_fraction.denominator.toString());
    this.log("normalized_pitch_to_lilypond, pitch is", pitch);
    if (pitch.my_type === "dash") {
      if (pitch.dash_to_tie === true) {
        pitch.normalized_pitch = pitch.pitch_to_use_for_tie.normalized_pitch;
        pitch.octave = pitch.pitch_to_use_for_tie.octave;
      } else {
        return "r" + duration + chord + ending;
      }
    }
    lilypond_pitch = lilypond_pitch_map[pitch.normalized_pitch];
    if (!(lilypond_pitch != null)) {
      return "???" + pitch.source;
    }
    lilypond_octave = lilypond_octave_map["" + pitch.octave];
    if (!(lilypond_octave != null)) {
      return "???" + pitch.octave;
    }
    mordent = has_mordent(pitch) ? "\\mordent" : "";
    begin_slur = item_has_attribute(pitch, "begin_slur") ? "(" : "";
    end_slur = item_has_attribute(pitch, "end_slur") ? ")" : "";
    in_slur = false;
    if (item_has_attribute(pitch, "begin_slur")) {
      in_slur = true;
    }
    if (item_has_attribute(pitch, "end_slur")) {
      in_slur = true;
    }
    if (false) {
      console.log("in_slur is", in_slur);
    }
    suppress_slurs = in_slur;
    if (context.in_slur) {
      suppress_slurs = true;
    }
    lilypond_symbol_for_tie = pitch.tied != null ? '~' : '';
    EXAMPLES = '\partial 4*2  | \afterGrace c\'4( { b32[ d\'32 c\'32 b32 c\'32] } c\'8) d\'8 \break\n\partial 4*2  | \afterGrace c\'4~ { b32[ d\'32 c\'32 b32 c\'32] } c\'8 d\'8 \break\n \partial 4*2  | c\'4~ c\'8 d\'8 \break';
    ornament = get_ornament(pitch);
    grace1 = grace2 = grace_notes = "";
    if ((ornament != null ? ornament.placement : void 0) === "after") {
      if (pitch.tied != null) {
        suppress_slurs = true;
      }
      if (context.in_slur) {
        suppress_slurs = true;
      }
      if (!context.in_slur) {
        begin_slur = "(";
      }
      grace1 = "\\afterGrace ";
      grace2 = " { " + (lilypond_grace_notes(ornament, suppress_slurs)) + " }";
    }
    if ((ornament != null ? ornament.placement : void 0) === "before") {
      suppress_slurs = true;
      grace1 = "\\acciaccatura {" + (lilypond_grace_notes(ornament, suppress_slurs)) + "}";
    }
    extra_end_slur = "";
    if (special_case) {
      extra_end_slur = ")";
    }
    if (((ornament != null ? ornament.placement : void 0) === "after") && (pitch.tied != null)) {
      if (false) {
        console.log("OMG");
      }
      lilypond_symbol_for_tie = "";
    }
    return "" + grace1 + lilypond_pitch + lilypond_octave + duration + lilypond_symbol_for_tie + mordent + begin_slur + extra_end_slur + end_slur + ending + chord + grace2;
  };
  lookup_lilypond_barline = function(barline_type) {
    var map;
    map = {
      "reverse_final_barline": '\\bar "|."',
      "final_barline": '\\bar "||"',
      "double_barline": '\\bar "||" ',
      "single_barline": "|",
      "left_repeat": '\\bar "|:" ',
      "right_repeat": '\\bar ":|" '
    };
    return map[barline_type] || map["single_barline"];
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
    "Fb": "ff",
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
    if (false) {
      console.log("********emit_tied_array");
    }
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
    if (false) {
      console.log("****", has_after_ornament(last_pitch));
    }
    if (has_after_ornament(last_pitch)) {
      if (false) {
        console.log("ADD CODE TO ADD RIGHT PARENT TO THIS PITCH", obj);
      }
    }
    return ary.push(normalized_pitch_to_lilypond(obj, {
      last_pitch: last_pitch
    }));
  };
  is_sargam_line = function(line) {
    if (!(line.kind != null)) {
      return false;
    }
    if (line.kind.indexOf('sargam') > -1) {
      return true;
    }
    if (line.kind.indexOf('number') > -1) {
      return true;
    }
  };
  notation_is_in_sargam = function(composition_data) {
    this.log("in notation_is_in_sargam");
    return root._.detect(composition_data.lines, function(line) {
      return is_sargam_line(line);
    });
  };
  beat_is_all_dashes = function(beat) {
    var fun;
    fun = function(item) {
      if (!(item.my_type != null)) {
        return true;
      }
      if (item.my_type === "dash") {
        return true;
      }
      if (item.my_type === "pitch") {
        return false;
      }
      return true;
    };
    return root.all_items(beat).every(fun);
  };
  lilypond_transpose = function(composition_data) {
    var fixed;
    if (composition_data.key === "C") {
      return "";
    }
    fixed = composition_data.key[0].toLowerCase();
    return "\\transpose c' " + lilypond_pitch_map[composition_data.key] + "'";
  };
  line_to_lilypond = function(line, options) {
    if (options == null) {
      options = {};
    }
    if (false) {
      console.log("line_to_lilypond");
    }
    return line_to_lilypond_array(line, options).join(' ');
  };
  has_after_ornament = function(pitch) {
    var ornament;
    if (!(pitch != null)) {
      return false;
    }
    ornament = get_ornament(pitch);
    if (!(ornament != null)) {
      return false;
    }
    return (ornament != null ? ornament.placement : void 0) === "after";
  };
  line_to_lilypond_array = function(line, options) {
    var all, ary, at_beginning_of_first_measure_of_line, beat, dash, dashes_at_beginning_of_line_array, disable_tuplet_numbers, in_slur, in_times, item, last_pitch, measure, tied_array, x, _i, _j, _len, _len2, _ref, _ref2;
    if (options == null) {
      options = {};
    }
    in_slur = false;
    ary = [];
    in_times = false;
    at_beginning_of_first_measure_of_line = false;
    dashes_at_beginning_of_line_array = [];
    tied_array = [];
    at_beginning_of_first_measure_of_line = false;
    in_times = false;
    this.log("processing " + line.source);
    all = [];
    x = root.all_items(line, all);
    last_pitch = null;
    for (_i = 0, _len = all.length; _i < _len; _i++) {
      item = all[_i];
      if (item_has_attribute(item, "begin_slur")) {
        in_slur = true;
      }
      if (((_ref = item.my_type) === "pitch" || _ref === "barline" || _ref === "measure") || item.is_barline) {
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
          for (_j = 0, _len2 = dashes_at_beginning_of_line_array.length; _j < _len2; _j++) {
            dash = dashes_at_beginning_of_line_array[_j];
            ary.push(normalized_pitch_to_lilypond(dash, {
              last_pitch: last_pitch
            }));
          }
          dashes_at_beginning_of_line_array = [];
        }
        ary.push(normalized_pitch_to_lilypond(item, {
          in_slur: in_slur,
          last_pitch: last_pitch
        }));
      }
      if (item.is_barline) {
        ary.push(lookup_lilypond_barline(item.my_type));
      }
      if (item.my_type === "beat") {
        beat = item;
        if (((_ref2 = beat.subdivisions) !== 0 && _ref2 !== 1 && _ref2 !== 2 && _ref2 !== 4 && _ref2 !== 8 && _ref2 !== 16 && _ref2 !== 32 && _ref2 !== 64 && _ref2 !== 128) && !beat_is_all_dashes(beat)) {
          this.log("odd beat.subdivisions=", beat.subdivisions);
          x = 2;
          if (beat.subdivisions === 6) {
            x = 4;
          }
          if (beat.subdivisions === 5) {
            x = 4;
          }
          disable_tuplet_numbers = "\\override TupletNumber #'stencil = ##f";
          ary.push("" + disable_tuplet_numbers + " \\times " + x + "/" + beat.subdivisions + " { ");
          in_times = true;
        }
      }
      if (item.my_type === "dash") {
        if (!item.dash_to_tie && (item.numerator != null)) {
          this.log("pushing item onto dashes_at_beginning_of_line_array");
          dashes_at_beginning_of_line_array.push(item);
        }
        if (item.dash_to_tie) {
          if (false) {
            console.log("dash_to_tie case!!***");
          }
          if (false) {
            console.log("dash_to_tie case!!***last_pitch is", last_pitch);
          }
          ary.push(normalized_pitch_to_lilypond(item, {
            last_pitch: last_pitch
          }));
          item = null;
        }
      }
      if ((item != null) && item.my_type === "measure") {
        measure = item;
        if (measure.is_partial) {
          ary.push("\\partial 4*" + measure.beat_count + " ");
        }
      }
      if ((item != null) && item.dash_to_tie) {
        if (item != null) {
          tied_array.push(item);
        }
      }
      if ((item != null) && item_has_attribute(item, "end_slur")) {
        in_slur = false;
      }
    }
    if (in_times) {
      ary.push("}");
      in_times = false;
    }
    if (false) {
      console.log("tied_array", tied_array.length);
    }
    if (tied_array.length > 0) {
      emit_tied_array(last_pitch, tied_array, ary);
    }
    ary.push("\\break\n");
    return ary;
  };
  to_lilypond = function(composition_data, options) {
    var ary, beats_per_minute, composer, composer_snippet, key_snippet, lilypond_template, line, mode, notes, src, src1, time, title, title_snippet, transpose_snip, _i, _len, _ref;
    if (options == null) {
      options = {};
    }
    ary = [];
    _ref = composition_data.lines;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      ary = ary.concat(line_to_lilypond_array(line, options));
    }
    mode = composition_data.mode;
    mode || (mode = "major");
    mode = mode.toLowerCase();
    composer = get_attribute(composition_data, "Author");
    composer_snippet = "";
    if (composer) {
      composer_snippet = "composer = \"" + composer + "\"";
    }
    title = get_attribute(composition_data, "Title");
    time = get_attribute(composition_data, "TimeSignature");
    transpose_snip = lilypond_transpose(composition_data);
    if (!notation_is_in_sargam(composition_data)) {
      transpose_snip = "";
    }
    if (!time) {
      time = "4/4";
    }
    key_snippet = "\\key c \\" + mode;
    if (!notation_is_in_sargam(composition_data)) {
      key_snippet = "\\key " + lilypond_pitch_map[composition_data.key] + " \\" + mode;
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
    if (options.omit_header) {
      title_snippet = composer_snippet = "";
    }
    beats_per_minute = 200;
    lilypond_template = " #(ly:set-option 'midi-extension \"mid\")\n \\version \"2.12.3\"\n \\include \"english.ly\"\n \\header{ \n " + title_snippet + "\n " + composer_snippet + "\n tagline = \"\"  % removed \n }\n%{\n" + src + "  \n%}\nmelody = {\n\\clef treble\n" + key_snippet + "\n\\time " + time + "\n\\autoBeamOn  \n" + notes + "\n}\n\ntext = \\lyricmode {\n " + (extract_lyrics(composition_data).join(' ')) + "\n}\n\n\\score{\n" + transpose_snip + "\n<<\n \\new Voice = \"one\" {\n   \\melody\n }\n \\new Lyrics \\lyricsto \"one\" \\text\n>>\n\\layout {\n \\context {\n      \\Score\n   \\remove \"Bar_number_engraver\"\n } \n }\n\\midi { \n \\context {\n   \\Score\n   tempoWholesPerMinute = #(ly:make-moment " + beats_per_minute + " 4)\n  }\n}\n}";
    return lilypond_template;
  };
  root.to_lilypond = to_lilypond;
  root.line_to_lilypond = line_to_lilypond;
}).call(this);
