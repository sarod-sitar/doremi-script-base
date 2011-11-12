(function() {
  var aux1, debug, first_logical_line, first_sargam_line, log, my_inspect, parse_without_reporting_error, parser, root, should_not_parse, sys, test_parses, utils;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  debug = false;
  sys = require('sys');
  utils = require('./tree_iterators.js');
  log = function(x) {
    if (!console) {
      return;
    }
    if (debug) {
      return console.log(x);
    }
  };
  require('./sargam_parser.js');
  log('SargamParser is', SargamParser);
  parser = SargamParser;
  log('parser is', parser);
  aux1 = function(str, result) {
    if (!sys) {
      return;
    }
    log("Result of parsing <<" + str + ">> is");
    return log(sys.inspect(result, true, null));
  };
  should_not_parse = function(str, test, msg) {
    log(str);
    log("Testing that <<" + str + ">> does NOT parse");
    return test.throws((function() {
      return parser.parse(str);
    }), "<<\n" + str + "\n>> should not parse!. " + msg);
  };
  parse_without_reporting_error = function(str) {
    log("Entering parse_without_reporting_error");
    log("Parsing <<\n" + str + ">>");
    try {
      return parser.parse(str);
    } catch (error) {
      return log("Didn't parse");
    }
  };
  first_sargam_line = function(composition_data) {
    return composition_data.logical_lines[0].sargam_line;
  };
  first_logical_line = function(composition_data) {
    return composition_data.logical_lines[0];
  };
  test_parses = function(str, test, msg) {
    var composition;
    if (msg == null) {
      msg = "";
    }
    composition = parser.parse(str);
    if (composition != null) {
      my_inspect(composition);
    }
    test.ok(composition != null, "" + str + " didn't parse!!. " + msg);
    return composition;
    /*
      test.doesNotThrow(-> result=parser.parse(str))
      test.ok(result?,"didn't parse")
      log(sys.inspect(result,false,null))
      */
  };
  my_inspect = function(obj, obj2) {
    if (obj2 == null) {
      obj2 = "";
    }
    if (!sys) {
      return;
    }
    JSON.stringify(obj);
    return JSON.stringify(obj2);
  };
  exports.test_bad_input = function(test) {
    var str;
    str = ':';
    should_not_parse(str, test);
    return test.done();
  };
  exports.test_does_not_accept_single_barline = function(test) {
    var str;
    str = '|';
    should_not_parse(str, test);
    return test.done();
  };
  exports.test_does_not_accepts_single_left_repeat = function(test) {
    var str;
    str = '|:';
    should_not_parse(str, test);
    return test.done();
  };
  exports.test_accepts_five_octaves_of_chromatic_notes = function(test) {
    var str;
    str = '                                                      .  .... .... .... : \n1) SrRg GmMP dDnN S | SrRg GmMP dDnN S | SrRg GmMP dDnN S| SrRg GmMP dDnN S |\n   :::: :::: :::: .   .... .... ....\n\n                     .  .... .... .... :   :::: :::: ::::\n2)  | SrRg GmMP dDnN S| SrRg GmMP dDnN S | SrRg GmMP dDnN ---- |';
    test_parses(str, test);
    return test.done();
  };
  exports.test_accepts_right_repeat = function(test) {
    var str;
    str = '|: :|';
    test_parses(str, test);
    return test.done();
  };
  exports.test_accepts_chords = function(test) {
    var str;
    str = ' V  i IVm\n|SR\n';
    test_parses(str, test);
    return test.done();
  };
  exports.test_eof_ends_beat = function(test) {
    var composition, line, measure, second_item, str;
    str = '|SR';
    composition = test_parses(str, test);
    my_inspect(composition);
    line = first_sargam_line(composition);
    measure = line.items[0];
    second_item = measure.items[1];
    my_inspect(second_item);
    test.equal(second_item.my_type, "beat", "second item of " + str + " should be a beat containing SR");
    test.equal(second_item.subdivisions, 2);
    return test.done();
  };
  exports.test_barline_ends_beat = function(test) {
    var composition, line, measure, second_item, str;
    str = '|SR|S';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    measure = line.items[0];
    second_item = measure.items[1];
    my_inspect(second_item);
    test.equal(second_item.my_type, "beat", "second item of " + str + " should be a beat containing SR");
    test.equal(second_item.subdivisions, 2);
    return test.done();
  };
  exports.test_dashes_inside_beat = function(test) {
    var composition, line, measure, second_item, str, x;
    str = '|S--R|';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    measure = line.items[0];
    second_item = measure.items[1];
    my_inspect(second_item);
    test.equal(second_item.my_type, "beat", "second item of " + str + " should be a beat containing S--R");
    test.equal(second_item.subdivisions, x = 4, "subdivisions of beat " + str + " should be " + x);
    return test.done();
  };
  exports.test_logical_lines = function(test) {
    var composition, second_item, str, third_item;
    str = '| S- |\n\n';
    composition = test_parses(str, test);
    my_inspect(composition);
    test.done();
    return;
    second_item = composition.lines[0].items[1];
    my_inspect(second_item);
    test.equal(second_item.my_type, "beat", "second item of " + str + " should be a beat");
    test.equal(second_item.items.length, 2, "the beat's length should be 2");
    test.equal(second_item.items[0].my_type, "dash", "dash should be first item");
    third_item = composition.lines[0].items[2];
    my_inspect(third_item);
    test.equal(third_item.my_type, "barline", "third item of " + str + " should be a barline");
    return test.done();
  };
  exports.test_dash_starts_beat = function(test) {
    var composition, line, measure, second_item, str;
    str = '|-R|';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    measure = line.items[0];
    second_item = measure.items[1];
    my_inspect(second_item);
    test.equal(second_item.my_type, "beat", "second item of " + str + " should be a beat");
    test.equal(second_item.items.length, 2, "the beat's length should be 2");
    test.equal(second_item.items[0].my_type, "dash", "dash should be first item");
    return test.done();
  };
  exports.test_recognizes_upper_octave_line = function(test) {
    var composition, str;
    str = '.:~*\nSRGR';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_recognizes_lower_octave_line = function(test) {
    var composition, str;
    str = 'SRG  R\n.:   *';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_recognizes_slurs = function(test) {
    var composition, str;
    str = '(S  R)\n .\n';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_accepts_delimited_beat = function(test) {
    var composition, str;
    str = '| <SR>\n';
    composition = test_parses(str, test);
    my_inspect(composition);
    return test.done();
  };
  exports.test_accepts_spaces_in_delimited_beat = function(test) {
    var composition, str;
    str = '| <S R>\n';
    composition = test_parses(str, test);
    my_inspect(composition);
    return test.done();
  };
  exports.test_accepts_delimited_beat = function(test) {
    var composition, str;
    str = '| <SR>\n';
    composition = test_parses(str, test);
    my_inspect(composition);
    return test.done();
  };
  exports.test_recognizes_ornament_symbol = function(test) {
    var composition, str;
    str = '~\nS  R';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_attributes = function(test) {
    var composition, str;
    str = 'Rag:Bhairavi\n\nSRG';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_logical_line_can_come_right_after_header_line = function(test) {
    var composition, str;
    str = 'Rag:Kafi\nS';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_leading_spaces_in_upper_octave_line = function(test) {
    var composition, str;
    str = 'Rag:Kafi\n\n          .\n   SRGmPDNS';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_leading_spaces_in_sargam_line = function(test) {
    var composition, str;
    str = 'Rag:Kafi\n\n   Sr';
    composition = test_parses(str, test);
    return test.done();
  };
  exports.test_gives_warning_if_misplaced_upper_octave_indicator = function(test) {
    var composition, str, z;
    str = 'Rag:Kafi\n  .\n   r';
    composition = test_parses(str, test);
    test.ok(composition.warnings.length > 0, "expected warnings");
    test.ok(composition.warnings[0].indexOf(z = "upper_octave_indicator") > -1, "Expected warning to include " + z + ". Warning was " + composition.warnings[0]);
    return test.done();
  };
  exports.test_gives_warning_if_unmatched_parens_for_slurs = function(test) {
    var composition, str, z;
    str = '(Pm';
    composition = test_parses(str, test);
    test.ok(composition.warnings.length > 0, "expected warnings");
    test.ok(composition.warnings[0].indexOf(z = "unbalanced parens") > -1, "Expected warning to include " + z + ". Warning was " + composition.warnings[0]);
    return test.done();
  };
  exports.test_gives_warning_if_syllable_under_right_paren = function(test) {
    var composition, str, z;
    str = '| <(Pm)>\n      nai- ';
    composition = test_parses(str, test);
    test.ok(composition.warnings.length > 0, "expected warnings");
    test.ok(composition.warnings[0].indexOf(z = "Attribute syllable above/below nothing" > -1), "Expected warning to include " + z + ", warning was " + warnings[0]);
    return test.done();
  };
  exports.test_gives_warning_if_syllable_under_left_paren = function(test) {
    var composition, str, z;
    str = '| <(Pm)>\n   nai- ';
    composition = test_parses(str, test);
    test.ok(composition.warnings.length > 0, "expected warnings");
    test.ok(composition.warnings[0].indexOf(z = "Attribute syllable above/below nothing" > -1), "Expected warning to include " + z + ", warning was " + warnings[0]);
    return test.done();
  };
  exports.test_gives_warning_if_syllable_not_under_note = function(test) {
    var composition, str, z;
    str = '|S\n  hi \n';
    composition = test_parses(str, test);
    test.ok(composition.warnings.length > 0, "No warnings");
    test.ok(composition.warnings[0].indexOf(z = "Attribute syllable above/below nothing" > -1), "Expected warning to include " + z + ", warning was " + warnings[0]);
    return test.done();
  };
  exports.test_syllable_assigned_to_note_above_it = function(test) {
    var beat, composition, line, measure, pitch, str;
    str = 'S\nhi \n';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    measure = line.items[0];
    beat = measure.items[0];
    test.equal("beat", beat.my_type);
    pitch = beat.items[0];
    test.equal("pitch", pitch.my_type);
    test.equal("hi", pitch.syllable);
    return test.done();
  };
  exports.test_upper_octave_assigned_to_note_below_it = function(test) {
    var beat, composition, line, measure, pitch, str;
    str = '.*::\nSrgm';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    my_inspect(line);
    measure = line.items[0];
    my_inspect("measure is", measure);
    beat = measure.items[0];
    my_inspect("beat is", beat);
    test.equal("beat", beat.my_type);
    pitch = beat.items[0];
    my_inspect("pitch is", pitch);
    test.equal("pitch", pitch.my_type);
    test.equal(beat.items[0].octave, 1, "" + str + " should have octave 1 for S");
    test.equal(beat.items[1].octave, 1, "" + str + " should have octave 1 for r");
    test.equal(beat.items[2].octave, 2, "" + str + " should have octave 2 for g");
    test.equal(beat.items[3].octave, 2, "" + str + " should have octave 2 for m");
    return test.done();
  };
  exports.test_lower_octave_assigned_to_note_above_it = function(test) {
    var beat, composition, line, measure, pitch, str;
    str = 'Srgm\n.*::';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    log("line is " + line);
    measure = line.items[0];
    test.equal("measure", measure.my_type);
    beat = measure.items[0];
    test.equal("beat", beat.my_type);
    pitch = beat.items[0];
    test.equal("pitch", pitch.my_type);
    my_inspect(line);
    test.equal(beat.items[0].octave, -1, "" + str + " should have octave -1 for S");
    test.equal(beat.items[1].octave, -1, "" + str + " should have octave -1 for r");
    test.equal(beat.items[2].octave, -2, "" + str + " should have octave -2 for g");
    test.equal(beat.items[3].octave, -2, "" + str + " should have octave -2 for m");
    return test.done();
  };
  exports.test_all = function(test) {
    var composition, first_sargam_source, line, str, x;
    x = 'dog';
    log("x=" + x);
    str = 'Rag:Bhairavi\nTal:Tintal\nTitle:Bansuri\nSource:AAK\n\n          3                   +            2         .\n1) |: (Sr | n) S   (gm Pd) || P - P  P   | P - D  (<nDSn>) |\n            .\n       ban-    su-  ri        ba- ja ra-   hi  dhu- na\n\n0                 3                     +     .    *  .\n| P  d   P   d    | <(Pm>   PmnP) (g m) || PdnS -- g  S |\n  ma-dhu-ra  kan-     nai-         ya      khe-    la-ta\n\n2              0     ~\n|  d-Pm g P  m | r - S :| %\n   ga-    wa-ta  ho- ri\n\n     +                     2    0     3     \n2)  [| Srgm PdnS SndP mgrS | %    | %   | S--S --S- ---- R-G-     |]\n';
    composition = test_parses(str, test);
    first_sargam_source = str.split('\n')[6];
    line = first_sargam_line(composition);
    test.equal(line.source, first_sargam_source, "sanity check, expected first line's source to be " + first_sargam_source);
    return test.done();
  };
  exports.test_parses_measure_at_beginning_of_line = function(test) {
    var composition, line, measure, str;
    str = 'Sr\nban-';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    measure = line.items[0];
    test.equal(measure.my_type, "measure", "<<" + str + ">> should be parsed as a measure with beat " + str);
    test.equal(measure.items[0].my_type, "beat", "<<" + str + ">> should be parsed as a measure with beat " + str);
    return test.done();
  };
  exports.test_parses_lyrics_line_without_leading_and_trailing_spaces = function(test) {
    var composition, str;
    str = 'Srgm|  S\nhe-llo john';
    composition = test_parses(str, test);
    return test.done();
    /*
      test.equal(lyrics.items[0].source,"he-","he- source should be he-")
      test.equal(lyrics.items[0].syllable,"he-","he- should be parsed as a syllable")
      test.equal(lyrics.items[1].syllable,"llo","llo should be parsed as a syllable")
      
      test.equal(lyrics.items[1].source,"llo","source for syllable should NOT include trailing white space!")
      test.equal(lyrics.items[3].source,"john","source for john should john")
      test.equal(lyrics.items[3].syllable,"john","john should be parsed as a syllable")
      aux1(str,composition)
      test.done()
      */
  };
  exports.test_collects_sargam_line_source = function(test) {
    var composition, expect, str;
    str = '|Sr  g    m    |';
    composition = test_parses(str, test);
    expect = "|Sr  g    m    |";
    test.equal(first_sargam_line(composition).source, "|Sr  g    m    |", "should collect source, expected " + expect + " . Note that eol is not included");
    return test.done();
  };
  exports.test_parses_lyrics_line_with_leading_and_trailing_spaces = function(test) {
    var composition, first, items, lyrics, str;
    str = '|Sr  g    m    |\n he- llo  john   ';
    /*
      Note that whitespace is included.
      lyric items are parsed something like:
         items: 
                 [ { my_type: 'whitespace', source: ' ' },
                   { my_type: 'syllable', syllable: 'he-', source: 'he-' },
                   { my_type: 'whitespace', source: ' ' },
                   { my_type: 'syllable', syllable: 'llo', source: 'llo' },
                   { my_type: 'whitespace', source: '  ' },
                   { my_type: 'syllable',
                     syllable: 'john',
                     source: 'john' },
                   { my_type: 'whitespace', source: '   ' } ] 
       */
    composition = test_parses(str, test);
    test.ok(composition.logical_lines != null, "parsed composition should have a logical_lines attribute");
    test.equal(composition.logical_lines.length, 1, "<<\n" + str + "\n>> should have 1 logical lines");
    first = first_logical_line(composition);
    lyrics = first.lyrics;
    items = lyrics.items;
    test.equal(items[0].source, " ", "should parse whitespace at beginning of line");
    test.equal(lyrics.items[1].syllable, "he-", "he- should be parsed as a syllable");
    test.equal(lyrics.items[1].source, "he-", "he- source should be he-");
    test.equal(items[2].source, " ", "should parse whitespace after he-");
    test.equal(lyrics.items[3].syllable, "llo", "llo should be parsed as a syllable");
    test.equal(lyrics.items[3].source, "llo", "source for syllable should not include trailing white space!");
    test.equal(items[2].my_type, "whitespace", "whitespace here");
    test.equal(lyrics.items[5].syllable, "john", "john should be parsed as a syllable");
    test.equal(lyrics.items[5].source, "john", "source for john should john");
    return test.done();
  };
  exports.test_position_counting = function(test) {
    var composition, str;
    str = 'Sr';
    composition = test_parses(str, test);
    aux1(str, composition);
    return test.done();
  };
  exports.test_parses_lines = function(test) {
    var composition, str;
    str = 'S\n\nR';
    composition = test_parses(str, test);
    my_inspect(composition);
    test.ok(composition.logical_lines != null, "parsed composition should have a logical_lines attribute");
    test.equal(composition.logical_lines.length, 2, "Should have 2 logical lines");
    aux1(str, composition);
    return test.done();
  };
  exports.test_position_counting = function(test) {
    var composition, str;
    str = 'Sr';
    composition = test_parses(str, test);
    aux1(str, composition);
    return test.done();
  };
  /*
  [ { my_type: 'sargam_line',
      items: 
           [ { my_type: 'pitch', source: 'S', octave: 0 },
                  { my_type: 'pitch', source: 'r', octave: 0 } ],
                      aux1: 'hi' } ]
  */
  exports.test_accepts_attributes = function(test) {
    var str;
    str = "hi:john\n";
    test_parses(str, test);
    return test.done();
  };
  exports.test_accepts_attributes2 = function(test) {
    var str;
    str = "hi:john\nhi:jane\n";
    test_parses(str, test);
    return test.done();
  };
  exports.test_accepts_attributes3 = function(test) {
    var str;
    str = "hi:john\nhi:jane\n\n\n\n   \n";
    test_parses(str, test);
    return test.done();
  };
  exports.test_accepts_double_barline = function(test) {
    var str;
    str = '|| S';
    test_parses(str, test, "should parse as a single measure with a single S");
    return test.done();
  };
  exports.test_accepts_mordent = function(test) {
    var str;
    str = '~\nS';
    test_parses(str, test);
    return test.done();
  };
  exports.test_sargam_characters_only_should_parse_as_sargam_line = function(test) {
    var composition, line, str;
    str = 'SrRgGmMPdDnN';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    test.equal(line.my_type, "sargam_line", "" + str + " only should parse as a  sargam_line and NOT a lyrics_line");
    return test.done();
  };
  exports.test_parses_one_as_tala = function(test) {
    var composition, line, str, x;
    debug = true;
    str = '1 \nS';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('tala') > -1, "" + x + " -1st line should have tala object");
    return test.done();
  };
  exports.test_ending_one_dot = function(test) {
    var composition, line, str, x;
    debug = true;
    str = '1.\nS';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('ending') > -1, "" + x + " -line should have ending object");
    return test.done();
  };
  exports.test_chord_iv = function(test) {
    var composition, line, str, x;
    debug = true;
    str = 'iv\nS';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('chord_symbol') > -1, "" + x + " -line should have chord object");
    return test.done();
  };
  exports.test_ending_one_dot_underscores = function(test) {
    var composition, line, str, x;
    str = '1.__\nS';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('ending') > -1, "" + x + " -line should have ending object");
    return test.done();
  };
  exports.test_ending_two_underscores = function(test) {
    var composition, line, str, x;
    str = '2______\nS';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('ending') > -1, "" + x + " -line should have ending object");
    return test.done();
  };
  exports.test_tivra_ma_devanagri = function(test) {
    var composition, line, str, x;
    debug = true;
    str = 'म\'\ntivrama';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf("source: 'म\\'") > -1, "" + x + " -line should have tivra ma");
    return test.done();
  };
  exports.test_devanagri_and_latin_sargam_together_should_fail = function(test) {
    var composition, str;
    debug = true;
    str = '       .\nसरग़मपधऩस SrRgGmMPdDnN\nSRGmPDNS';
    composition = should_not_parse(str, test);
    return test.done();
  };
  exports.test_devanagri = function(test) {
    var composition, line, str, x, z;
    debug = true;
    str = '       .\nसरग़मपधऩस\nSRGmPDNS';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('स') > -1, "" + x + " -line should have स");
    test.ok(x.indexOf('denominator: 8') > -1, "" + x + " -line should have 8 pitches");
    test.equal(line.kind, z = "devanagri", "line.kind should be " + z);
    return test.done();
  };
  exports.test_kommal_indicator = function(test) {
    var composition, line, str, x;
    str = 'र\n_';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    test.ok(x.indexOf('kommal_indicator') > -1, "" + x + " -line should have kommal indicator");
    return test.done();
  };
  exports.test_abc = function(test) {
    var composition, line, str, x;
    str = 'C#D#F#G#A#B#DbEbGbAbBbCC#DbDD#EbEFF#GbGAbAA#BbBB# ';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    x = sys.inspect(line, true, null);
    return test.done();
  };
  exports.test_measure_pitch_durations = function(test) {
    var composition, line, my_pitch, str;
    str = '--S- ---- --r-';
    composition = test_parses(str, test);
    line = first_sargam_line(composition);
    my_pitch = utils.tree_find(line, function(item) {
      return item.source === "S";
    });
    return test.done();
  };
  exports.test_zzz = function(test) {
    var str;
    str = '                    ..\nCDbDEb EFF#G AbABbB CD\n\n            ..\nSrGmMP dDnN SR \n\n            \nसररग़ग़ मम\'पधधऩऩ\n_ _      _ __\n';
    return test.done();
  };
}).call(this);
