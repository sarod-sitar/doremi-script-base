(function() {
  var debug, directive_for_chord_template_str, directive_template_str, display_mode, draw_grace_note, draw_measure, draw_note, draw_ornaments, fraction_to_musicxml_type_and_dots, fs, grace_note_after_template_str, grace_note_template_str, load_composition_mustache_from_file_system, mode_directive, mode_directive_template_str, music_xml_chord, musicxml_alter, musicxml_beats, musicxml_duration, musicxml_fifths, musicxml_lyric, musicxml_octave, musicxml_step, musicxml_transpose, musicxml_type_and_dots, note_template_str, root, shared, templates, to_musicxml, transpose_template_str;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  if (typeof require !== "undefined" && require !== null) {
    fs = require('fs');
  }
  if (typeof require !== "undefined" && require !== null) {
    shared = require('./shared.js');
    root._ = require("underscore")._;
    root._.extend(root, shared);
  }
  root._.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };
  templates = {};
  load_composition_mustache_from_file_system = function() {
    if (typeof require !== "undefined" && require !== null) {
      return templates.composition = root._.template(fs.readFileSync(__dirname + '/composition.mustache', 'UTF-8'));
    }
  };
  load_composition_mustache_from_file_system();
  debug = true;
  fraction_to_musicxml_type_and_dots = {
    "2/1": "<type>half</type>",
    "3/1": "<type>half</type><dot/>",
    "4/1": "<type>whole</type>",
    "5/1": "<type>whole</type><dot/><dot/>",
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
    "1/4": "<type>16th</type>",
    "2/4": "<type>eighth</type>",
    "3/4": "<type>eighth</type><dot/>",
    "3/8": "<type>16th</type><dot/>"
  };
  to_musicxml = function(composition) {
    var ary, composer, context, item, line, params, time, _i, _j, _len, _len2, _ref, _ref2;
    context = {
      in_slur: false,
      slur_number: 0,
      measure_number: 1
    };
    ary = [];
    _ref = composition.lines;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      _ref2 = root.all_items(line);
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        item = _ref2[_j];
        if (item.my_type === "measure") {
          ary.push(draw_measure(item, context));
          context.measure_number++;
        }
      }
    }
    composer = root.get_composition_attribute(composition, "Author");
    time = root.get_time(composition);
    params = {
      body: ary.join(" "),
      movement_title: root.get_title(composition),
      title: root.get_title(composition),
      composer: "",
      poet: "",
      beats: musicxml_beats(composition),
      encoding_date: "",
      fifths: musicxml_fifths(composition),
      mode_directive: mode_directive(composition),
      mode: composition.mode,
      transpose: musicxml_transpose(composition)
    };
    return templates.composition(params);
  };
  note_template_str = '{{before_ornaments}}\n{{chord}}\n<note>\n  <pitch>\n    <step>{{step}}</step>\n    {{alter}}\n    <octave>{{octave}}</octave>\n  </pitch>\n  <duration>{{duration}}</duration>\n  {{tie}}\n  <voice>1</voice>\n  {{type_and_dots}}\n  {{lyric}}\n  <notations>{{tied}}\n  {{end_slur}}{{begin_slur}}</notations>\n </note>\n {{after_ornaments}}';
  templates.note = root._.template(note_template_str);
  musicxml_beats = function(composition) {
    var result, time_signature;
    time_signature = composition.time_signature;
    console.log;
    if (!time_signature) {
      return 4;
    }
    if (time_signature === "") {
      return 4;
    }
    result = /^([0-9]+)\//.exec(time_signature);
    if (!(result != null)) {
      return 4;
    }
    return result[1];
  };
  draw_note = function(pitch, context) {
    var after_ornaments, before_ornaments, begin_slur, divisions_per_quarter, duration, end_slur, f, frac2, fraction, params, tie, tied, tied2, type_and_dots, x, _ref, _ref2;
    if (pitch.my_type === "dash") {
      if (!(pitch.pitch_to_use_for_tie != null)) {
        return "";
      }
    }
    _ref = draw_ornaments(pitch, context), before_ornaments = _ref[0], after_ornaments = _ref[1];
    if ((pitch.dash_to_tie != null) && pitch.dash_to_tie === true) {
      pitch.normalized_pitch = pitch.pitch_to_use_for_tie.normalized_pitch;
      pitch.octave = pitch.pitch_to_use_for_tie.octave;
    }
    if (pitch.my_type === "dash") {
      if ((pitch.dash_to_tie != null) && pitch.dash_to_tie === false) {
        return;
      }
    }
    fraction = new Fraction(pitch.numerator, pitch.denominator);
    divisions_per_quarter = 24;
    frac2 = fraction.multiply(divisions_per_quarter);
    duration = frac2.numerator;
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
    type_and_dots = musicxml_type_and_dots(f.numerator, f.denominator);
    tie = "";
    tied = "";
    if (pitch.tied != null) {
      tie = "<tie type=\"start\"/>";
      tied = "<tied type=\"start\"/>";
    }
    if (pitch.my_type === "dash" && pitch.dash_to_tie === true) {
      tied2 = "<tied type=\"stop\"/>";
      tied = tied2 + tied;
    }
    begin_slur = end_slur = "";
    if (item_has_attribute(pitch, "end_slur")) {
      end_slur = "<slur number=\"" + context.slur_number + "\" type=\"stop\"/>";
      context.in_slur = false;
    }
    if (item_has_attribute(pitch, "begin_slur")) {
      begin_slur = "<slur number=\"" + (++context.slur_number) + "\" type=\"start\"/>";
      context.in_slur = true;
    }
    params = {
      step: musicxml_step(pitch),
      octave: musicxml_octave(pitch),
      duration: duration,
      alter: musicxml_alter(pitch),
      type_and_dots: type_and_dots,
      tied: tied,
      tie: tie,
      lyric: musicxml_lyric(pitch),
      begin_slur: begin_slur,
      end_slur: end_slur,
      before_ornaments: before_ornaments,
      after_ornaments: after_ornaments,
      chord: music_xml_chord(pitch)
    };
    return templates.note(params);
  };
  music_xml_chord = function(pitch) {
    var chord;
    chord = get_item_attribute(pitch, "chord_symbol");
    if (!(chord != null) || (chord === "")) {
      return "";
    }
    return templates.chord({
      chord: chord.source
    });
  };
  musicxml_lyric = function(pitch, context) {
    if (!(pitch.syllable != null) || pitch.syllable === "") {
      return "";
    }
    return "<lyric number=\"1\">\n   <text>" + pitch.syllable + "</text>\n</lyric>";
  };
  musicxml_type_and_dots = function(numerator, denominator) {
    var alternate, frac, looked_up_duration;
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
  mode_directive = function(composition) {
    if (composition.mode === "major") {
      return "";
    }
    return templates.mode_directive({
      words: composition.mode
    });
  };
  directive_for_chord_template_str = "            <direction placement=\"above\">\n                <direction-type>\n<words default-x=\"-1\" default-y=\"15\" font-size=\"medium\" font-weight=\"normal\">{{chord}}</words>\n                </direction-type>\n            </direction>";
  templates.chord = root._.template(directive_for_chord_template_str);
  directive_template_str = "<direction placement=\"above\">\n	<direction-type>\n		<words default-x=\"-1\" default-y=\"15\" font-size=\"medium\" font-weight=\"normal\">{{words}} \n		</words>\n	</direction-type>\n</direction>";
  templates.directive = root._.template(directive_template_str);
  transpose_template_str = "<transpose>\n  <diatonic>{{diatonic}}</diatonic>\n  <chromatic>{{chromatic}}</chromatic>\n</transpose>";
  templates.transpose = root._.template(transpose_template_str);
  mode_directive_template_str = "<direction placement=\"above\">\n	<direction-type>\n		<words default-x=\"-1\" default-y=\"15\" font-size=\"medium\" font-weight=\"normal\">{{words}} \n		</words>\n	</direction-type>\n</direction>";
  templates.directive = root._.template(directive_template_str);
  templates.mode_directive = root._.template(mode_directive_template_str);
  display_mode = function(composition) {};
  grace_note_template_str = "<note>\n  <grace {{steal_time}} />\n  <pitch>\n    <step>{{step}}</step>\n          {{alter}}\n    <octave>{{octave}}</octave>\n  </pitch>\n  <voice>1</voice>\n  <type>{{type}}</type>\n</note>";
  templates.grace_note = root._.template(grace_note_template_str);
  grace_note_after_template_str = "  <grace steal-time-previous=\"{{steal_time_percentage}}\"/>\n  <pitch>\n    <step>{{step}}</step>\n          {{alter}}\n    <octave>{{octave}}</octave>\n  </pitch>\n  <voice>1</voice>\n  <type>{{type}}</type>\n</note>";
  templates.grace_note_after = root._.template(grace_note_after_template_str);
  draw_grace_note = function(ornament_item, which, len, steal_time, placement, context) {
    var params;
    if (steal_time == null) {
      steal_time = "";
    }
    params = {
      step: musicxml_step(ornament_item),
      alter: musicxml_alter(ornament_item),
      octave: musicxml_octave(ornament_item),
      type: "<span>32nd</span>",
      steal_time: steal_time
    };
    return templates.grace_note(params);
  };
  musicxml_fifths = function(composition) {
    var hash, mode, result;
    mode = composition.mode;
    if (!mode) {
      return 0;
    }
    if (mode === "") {
      return 0;
    }
    hash = {
      lydian: 1,
      major: 0,
      mixolydian: -1,
      dorian: -2,
      minor: -3,
      aolian: -3,
      phrygian: -4,
      locrian: -5
    };
    result = hash[mode];
    if (!result) {
      return 0;
    }
    return result;
  };
  draw_ornaments = function(pitch, context) {
    var after_ary, before_ary, ctr, len, num, ornament, steal_time, x;
    before_ary = [];
    ornament = root.get_ornament(pitch);
    if (!ornament) {
      return ['', ''];
    }
    if (ornament.placement === "after") {
      return "";
    }
    if (ornament.placement === "before") {
      len = ornament.ornament_items.length;
      steal_time = "";
      before_ary = (function() {
        var _len, _ref, _results;
        _ref = ornament.ornament_items;
        _results = [];
        for (ctr = 0, _len = _ref.length; ctr < _len; ctr++) {
          x = _ref[ctr];
          _results.push(draw_grace_note(x, ctr, len, steal_time, ornament.placement, context));
        }
        return _results;
      })();
      return [before_ary.join("/n"), ""];
    }
    if (ornament.placement === "after") {
      len = ornament.ornament_items.length;
      num = 50 / len;
      steal_time = "steal-time-previous=\"" + num + "\"";
      after_ary = (function() {
        var _len, _ref, _results;
        _ref = ornament.ornament_items;
        _results = [];
        for (ctr = 0, _len = _ref.length; ctr < _len; ctr++) {
          x = _ref[ctr];
          _results.push(draw_grace_note(x, ctr, len, steal_time, ornament.placement, context));
        }
        return _results;
      })();
      return ["", after_ary.join('')];
    }
    return ["", ""];
  };
  musicxml_transpose = function(composition) {
    var orig;
    orig = "d";
    return templates.transpose({
      diatonic: 1,
      chromatic: 2
    });
  };
  musicxml_step = function(pitch) {
    if (!pitch) {
      return "";
    }
    if (!(pitch.normalized_pitch != null)) {
      return "";
    }
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
    _ref = root.all_items(measure);
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
    if (context.measure_number === 1) {
      measure = "";
    }
    return "" + measure + "\n" + (ary.join(' ')) + "\n</measure>";
  };
  to_musicxml.templates = templates;
  root.to_musicxml = to_musicxml;
}).call(this);
