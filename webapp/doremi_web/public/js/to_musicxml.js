(function() {
  var all_items_in_line, beat_is_all_dashes, debug, draw_grace_note, draw_measure, draw_note, draw_ornaments, emit_tied_array, fraction_to_musicxml_type_and_dots, fs, get_attribute, get_chord, get_ending, get_ornament, grace_note_template_str, has_mordent, is_sargam_line, is_valid_key, lilypond_grace_note_pitch, lilypond_grace_notes, lilypond_octave_map, lilypond_pitch_map, log, lookup_lilypond_barline, lookup_lilypond_pitch, musicxml_alter, musicxml_duration, musicxml_octave, musicxml_step, musicxml_type_and_dots, my_inspect, normalized_pitch_to_lilypond, normalized_pitch_to_musicxml_step, notation_is_in_sargam, note_template_str, root, running_under_node, templates, to_musicxml, x;
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
  fraction_to_musicxml_type_and_dots = {
    "2/1": "<type>half</type>",
    "3/1": "<type>half</type><dot/>",
    "4/1": "<type>whole</type>",
    "5/1": "<type>whole</type><dot/><dot/>",
    "1/1": "<type>quarter</type>",
    "1/2": "<type>eighth</type>",
    "1/3": "<type>eighth</type>",
    "1/4": "<type>16th</type>",
    "1/8": "<type>32nd</type>",
    "1/9": "<type>eighth</type>",
    "1/11": "<type>eighth</type>",
    "1/13": "<type>eighth</type>",
    "1/5": "<type>16th</type>",
    "2/5": "<type>eighth</type>",
    "3/5": "<type>eighth</type><dot/>",
    "4/5": "<type>quarter</type>",
    "5/5": "<type>quarter</type>",
    "6/6": "<type>quarter</type>",
    "7/7": "<type>quarter</type>",
    "8/8": "<type>quarter</type>",
    "9/9": "<type>quarter</type>",
    "10/10": "<type>quarter</type>",
    "11/11": "<type>quarter</type>",
    "12/12": "<type>quarter</type>",
    "13/13": "<type>quarter</type>",
    "1/7": "<type>thirtysecond</type>",
    "2/7": "<type>16th</type>",
    "3/7": "<type>16th</type><dot/>",
    "4/7": "<type>eighth</type>",
    "5/7": "<type>eighth</type><dot/><dot/>",
    "2/8": "<type>16th</type>",
    "3/8": "<type>16th</type><dot/>",
    "5/8": "<type>eighth</type>",
    "4/8": "<type>eighth</type>",
    "7/8": "<type>eighth</type><dot/><dot/>",
    "1/6": "<type>16th</type>",
    "2/6": "<type>eighth</type>",
    "3/6": "<type>quarter</type>",
    "4/6": "<type>quarter</type>",
    "5/6": "<type>eighth</type><dot/><dot/>",
    "2/2": "<type>quarter</type>",
    "3/3": "<type>quarter</type>",
    "4/4": "<type>quarter</type>",
    "8/8": "<type>quarter</type>",
    "1/4": "<type>16th</type>",
    "2/4": "<type>eighth</type>",
    "3/4": "<type>eighth</type><dot/>",
    "3/8": "<type>16th</type><dot/>"
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
    return "";
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
  is_valid_key = function(str) {
    var ary;
    ary = ["c", "d", "e", "f", "g", "a", "b", "cs", "df", "ds", "ef", "fs", "gb", "gs", "ab", "as", "bf"];
    return _.indexOf(ary, str) > -1;
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
    var all, ary, at_beginning_of_first_measure_of_line, composer, composer_snippet, context, dashes_at_beginning_of_line_array, in_times, item, key_is_valid, key_snippet, last_pitch, line, mode, notes, params, src, src1, tied_array, time, title, title_snippet, transpose_snip, x, _i, _j, _len, _len2, _ref;
    context = {
      slur_number: 0,
      measure_number: 2
    };
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
        if (item.my_type === "measure") {
          ary.push(draw_measure(item, context));
          context.measure_number++;
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
  "<note default-y=\"-30.00\" default-x=\"108.08\">\n    <pitch>\n        <step>G</step>\n        <octave>4</octave>\n    </pitch>\n    <duration>2</duration>\n    <voice>1</voice>\n    <type>eighth</type>\n    <stem>up</stem>\n    <beam number=\"1\">begin</beam>\n    <lyric number=\"1\">\n        <syllabic>begin</syllabic>\n        <text>Yes</text>\n    </lyric>\n    <lyric number=\"2\">\n        <syllabic>begin</syllabic>\n        <text>Sud</text>\n    </lyric>\n</note>";
  note_template_str = '        {{before_ornaments}}\n        <note>\n          <pitch>\n            <step>{{step}}</step>\n            {{alter}}\n            <octave>{{octave}}</octave>\n          </pitch>\n          <duration>{{duration}}</duration>\n          {{tie}}\n          <voice>1</voice>\n          {{type_and_dots}}\n          {{lyric}}\n          <notations>{{tied}}{{begin_slur}}{{end_slur}}</notations>\n</note>';
  templates.note = _.template(note_template_str);
  x = "\ndivisions set to 96 per note\n\nif our note is S-R-\n\nthen sa has fraction 2/4\n\n2/4 * 1/4 = 2/16th, an eighth note\n\nbut divisions is 96 so multiply by\n\n2/16 = x/96\n\nx= 2/16 *96\n\n\n1/2 of a  1/4 is 1/8   1/8=x/24 =3\n\nexample- 2/4\n\n2/4 * 1/4 *24 = 2/4 * 6 = 3\n                <lyric number=\"1\">\n                    <syllabic>begin</syllabic>\n                    <text>Yes</text>\n                </lyric>\n";
  draw_note = function(pitch, context) {
    var after_ornaments, before_ornaments, begin_slur, divisions_per_quarter, duration, end_slur, f, frac2, fraction, lyric, params, tie, tied, tied2, type_and_dots, _ref, _ref2;
    if (!running_under_node()) {
      console.log("Entering draw_note, pitch is " + pitch);
    }
    if (pitch.my_type === "dash") {
      if (!(pitch.pitch_to_use_for_tie != null)) {
        return "";
      }
    }
    _ref = draw_ornaments(pitch), before_ornaments = _ref[0], after_ornaments = _ref[1];
    if ((pitch.dash_to_tie != null) && pitch.dash_to_tie === true) {
      pitch.normalized_pitch = pitch.pitch_to_use_for_tie.normalized_pitch;
      pitch.octave = pitch.pitch_to_use_for_tie.octave;
    }
    if (pitch.my_type === "dash") {
      if ((pitch.dash_to_tie != null) && pitch.dash_to_tie === false) {
        return;
      }
    }
    if (!running_under_node()) {
      console.log("");
    }
    fraction = new Fraction(pitch.numerator, pitch.denominator);
    divisions_per_quarter = 24;
    frac2 = fraction.multiply(divisions_per_quarter);
    duration = frac2.numerator;
    if (!running_under_node()) {
      console.log("frac2 is", frac2);
    }
    if ((_ref2 = pitch.denominator) !== 0 && _ref2 !== 1 && _ref2 !== 2 && _ref2 !== 4 && _ref2 !== 8 && _ref2 !== 16 && _ref2 !== 32 && _ref2 !== 64 && _ref2 !== 128) {
      x = 2;
      if (pitch.denominator === 6) {
        x = 4;
      }
      if (pitch.denominator === 5) {
        x = 4;
      }
      duration = divisions_per_quarter / x;
    }
    if (pitch.fraction_array != null) {
      f = pitch.fraction_array[0];
    } else {
      f = pitch;
    }
    if (!running_under_node()) {
      console.log("numerator,denominator", f.numerator, f.denominator);
    }
    type_and_dots = musicxml_type_and_dots(f.numerator, f.denominator);
    tie = "";
    tied = "";
    if (pitch.tied != null) {
      tie = "<tie type=\"start\"/>";
      tied = "<tied type=\"start\"/>";
    }
    if (pitch.my_type === "dash" && pitch.dash_to_tie === true) {
      tied2 = "<tied type=\"end\"/>";
      tied = tied + tied2;
    }
    lyric = "";
    if (pitch.syllable != null) {
      lyric = "<lyric number=\"1\">\n  <text>" + pitch.syllable + "</text>\n</lyric>";
    }
    begin_slur = end_slur = "";
    if (item_has_attribute(pitch, "end_slur")) {
      end_slur = "<slur number=\"" + context.slur_number + "\" type=\"stop\"/>";
    }
    if (item_has_attribute(pitch, "begin_slur")) {
      begin_slur = "<slur number=\"" + (context.slur_number++) + "\" type=\"start\"/>";
    }
    params = {
      step: musicxml_step(pitch),
      octave: musicxml_octave(pitch),
      duration: duration,
      alter: musicxml_alter(pitch),
      type_and_dots: type_and_dots,
      tied: tied,
      tie: tie,
      lyric: lyric,
      begin_slur: begin_slur,
      end_slur: end_slur,
      before_ornaments: before_ornaments,
      after_ornaments: after_ornaments
    };
    return templates.note(params);
  };
  musicxml_type_and_dots = function(numerator, denominator) {
    var alternate, frac, looked_up_duration;
    if (!running_under_node()) {
      console.log("musicxml_type_and_dots(" + numerator + "," + denominator);
    }
    if (numerator === denominator) {
      return "<type>quarter</type>";
    }
    frac = "" + numerator + "/" + denominator;
    looked_up_duration = fraction_to_musicxml_type_and_dots[frac];
    if (!(looked_up_duration != null)) {
      alternate = "<type>16th</type>";
      return alternate;
    }
    return looked_up_duration;
  };
  grace_note_template_str = "<note>\n  <grace/>\n  <pitch>\n    <step>{{step}}</step>\n    <octave>{{octave}}</octave>\n  </pitch>\n  <voice>1</voice>\n  <type>{{type}}</type>\n</note>";
  templates.grace_note = _.template(grace_note_template_str);
  draw_grace_note = function(ornament_item) {
    var params;
    params = {
      step: "G",
      octave: "4",
      type: "16th"
    };
    return templates.grace_note(params);
  };
  draw_ornaments = function(pitch) {
    var before_ary, ornament, x;
    if (!running_under_node()) {
      console.log("Entering draw_ornaments", pitch);
    }
    before_ary = [];
    ornament = get_ornament(pitch);
    if (!ornament) {
      return ['', ''];
    }
    if (ornament.placement === "before") {
      before_ary = (function() {
        var _i, _len, _ref, _results;
        _ref = ornament.ornament_items;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          _results.push(draw_grace_note(x));
        }
        return _results;
      })();
    }
    return [before_ary.join("/n"), ""];
  };
  musicxml_step = function(pitch) {
    return pitch.normalized_pitch[0];
  };
  musicxml_alter = function(pitch) {
    var alt;
    alt = "";
    if (pitch.normalized_pitch.indexOf('#') > -1) {
      alt = "1";
    } else if (pitch.normalized_pitch.indexOf('b') > -1) {
      alt = "-1";
    } else {
      return "";
    }
    return "<alter>" + alt + "</alter>";
  };
  musicxml_octave = function(pitch) {
    return pitch.octave + 4;
  };
  musicxml_duration = function(pitch) {
    return 1;
  };
  draw_measure = function(measure, context) {
    var ary, item, _i, _len, _ref;
    ary = [];
    _ref = all_items(measure);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (item.my_type === "pitch") {
        ary.push(draw_note(item, context));
      }
      if (item.my_type === "dash") {
        ary.push(draw_note(item, context));
      }
    }
    measure = "<measure number=\"" + context.measure_number + "\">";
    if (context.measure_number === 2) {
      measure = "";
    }
    return "" + measure + "\n" + (ary.join(' ')) + "\n</measure>";
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
