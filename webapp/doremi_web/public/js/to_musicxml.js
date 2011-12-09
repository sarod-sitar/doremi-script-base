(function() {
  var all_items_in_line, beat_is_all_dashes, calculate_lilypond_duration, debug, draw_measure, draw_note, emit_tied_array, extract_lyrics, fraction_to_lilypond, fs, get_attribute, get_chord, get_ending, get_ornament, has_mordent, is_sargam_line, is_valid_key, lilypond_grace_note_pitch, lilypond_grace_notes, lilypond_octave_map, lilypond_pitch_map, log, lookup_lilypond_barline, lookup_lilypond_pitch, musicxml_duration, musicxml_octave, musicxml_step, my_inspect, normalized_pitch_to_lilypond, normalized_pitch_to_musicxml_step, notation_is_in_sargam, note_template_str, root, running_under_node, templates, to_musicxml, x;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  if (typeof require !== "undefined" && require !== null) {
    fs = require('fs');
  }
  templates = {};
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };
  if (typeof require !== "undefined" && require !== null) {
    templates.composition = _.template(fs.readFileSync(__dirname + '/composition.mustache', 'UTF-8'));
  }
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
    return _.detect(pitch.attributes, function(attribute) {
      return attribute.my_type === "ornament";
    });
  };
  has_mordent = function(pitch) {
    if (!(pitch.attributes != null)) {
      return false;
    }
    return _.detect(pitch.attributes, function(attribute) {
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
  lilypond_grace_notes = function(ornament) {
    var ary, begin_beam, begin_slur, end_beam, end_slur, length, needs_beam, pitch;
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
    if (needs_beam) {
      begin_beam = "[";
      end_beam = "]";
    }
    ary[0] = "" + ary[0] + begin_slur + begin_beam;
    length = ary.length;
    ary[length - 1] = "" + ary[length - 1] + end_beam;
    return ary.join(' ');
  };
  get_chord = function(item) {
    var e;
    if (e = _.detect(item.attributes, function(x) {
      return x.my_type === "chord_symbol";
    })) {
      return "^\"" + e.source + "\"";
    }
    return "";
  };
  get_ending = function(item) {
    var e;
    if (e = _.detect(item.attributes, function(x) {
      return x.my_type === "ending";
    })) {
      return "^\"" + e.source + "\"";
    }
    return "";
  };
  normalized_pitch_to_musicxml_step = function(normalized_pitch) {};
  normalized_pitch_to_lilypond = function(pitch) {
    var begin_slur, chord, duration, end_slur, ending, first_fraction, grace1, grace2, grace_notes, lilypond_octave, lilypond_pitch, lilypond_symbol_for_tie, mordent, ornament;
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
    lilypond_symbol_for_tie = pitch.tied != null ? '~' : '';
    ornament = get_ornament(pitch);
    grace1 = grace2 = grace_notes = "";
    if ((ornament != null ? ornament.placement : void 0) === "after") {
      grace1 = "\\afterGrace ";
      grace2 = "( { " + (lilypond_grace_notes(ornament)) + ") }";
    }
    if ((ornament != null ? ornament.placement : void 0) === "before") {
      grace1 = "\\acciaccatura {" + (lilypond_grace_notes(ornament)) + "}";
    }
    "" + grace1 + lilypond_pitch + lilypond_octave + duration + lilypond_symbol_for_tie + mordent + begin_slur + end_slur + ending + chord + grace2;
    return "<note>\n  <attributes>\n  <divisions>" + pitch.denominator + "</divisions>\n  </attributes>\n  <pitch>\n    <step>" + (musicxml_step(pitch)) + "->\n    </step>\n    <octave>" + (musicxml_octave(pitch)) + "</octave>\n  </pitch>\n  <duration>" + pitch.numerator + "</duration>\n  <type>whole</type>\n</note>";
  };
  lookup_lilypond_barline = function(barline_type) {
    var map;
    map = {
      "reverse_final_barline": '\\bar "|."',
      "final_barline": '\\bar "||"',
      "double_barline": '\\bar "||" ',
      "single_barline": '\\bar "|" ',
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
    return all_items_in_line(beat).every(fun);
  };
  to_musicxml = function(composition_data) {
    var all, ary, at_beginning_of_first_measure_of_line, composer, composer_snippet, dashes_at_beginning_of_line_array, in_times, item, key_is_valid, key_snippet, last_pitch, line, measure_ctr, mode, notes, params, src, src1, tied_array, time, title, title_snippet, transpose_snip, x, _i, _j, _len, _len2, _ref;
    ary = [];
    measure_ctr = 2;
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
        if (item.my_type === "measure") {
          ary.push(draw_measure(item, measure_ctr));
          measure_ctr = measure_ctr + 1;
        }
      }
    }
    mode = get_attribute(composition_data, 'Mode');
    mode || (mode = "major");
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
    params = {
      body: ary.join(" "),
      movement_title: title,
      composer: "",
      poet: "",
      encoding_date: "",
      mode: mode
    };
    templates.composition(params);
    return templates.composition(params);
  };
  note_template_str = '<note>\n    <pitch>\n        <step>{{step}}</step>\n        <octave>{{octave}}</octave>\n    </pitch>\n    <duration>{{duration}}</duration>\n    <voice>1</voice>\n</note>';
  templates.note = _.template(note_template_str);
  x = "\ndivisions set to 96 per note\n\nif our note is S-R-\n\nthen sa has fraction 2/4\n\n2/4 * 1/4 = 2/16th, an eighth note\n\nbut divisions is 96 so multiply by\n\n2/16 = x/96\n\nx= 2/16 *96\n\n\n1/2 of a  1/4 is 1/8   1/8=x/24 =3\n\nexample- 2/4\n\n2/4 * 1/4 *24 = 2/4 * 6 = 3\n";
  draw_note = function(pitch) {
    var divisions_per_quarter, frac2, fraction, params;
    divisions_per_quarter = 24;
    fraction = new Fraction(pitch.numerator, pitch.denominator);
    frac2 = fraction.multiply(divisions_per_quarter);
    params = {
      step: musicxml_step(pitch),
      octave: musicxml_octave(pitch),
      duration: frac2.numerator
    };
    return templates.note(params);
  };
  musicxml_step = function(pitch) {
    return pitch.normalized_pitch[0];
  };
  musicxml_octave = function(pitch) {
    return pitch.octave + 4;
  };
  musicxml_duration = function(pitch) {
    return 1;
  };
  draw_measure = function(measure, ctr) {
    var ary, item, _i, _len, _ref;
    ary = [];
    _ref = all_items(measure);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (item.my_type === "pitch") {
        ary.push(draw_note(item));
      }
    }
    measure = "<measure number=\"" + ctr + "\">";
    if (ctr === 2) {
      measure = "";
    }
    return " \n" + measure + "\n" + (ary.join(' ')) + "\n</measure>";
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
  to_musicxml.templates = templates;
  root.to_musicxml = to_musicxml;
}).call(this);
