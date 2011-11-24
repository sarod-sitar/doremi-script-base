(function() {
  var debug, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  debug = false;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  root.ParserHelper = {
    trim: function(val) {
      if (String.prototype.trim != null) {
        return val.trim();
      } else {
        return val.replace(/^\s+|\s+$/g, "");
      }
    },
    sa_helper: function(source, normalized) {
      var obj;
      obj = {
        source: source,
        normalized_pitch: normalized
      };
      return obj;
    },
    parse_line: function(uppers, sargam, lowers, lyrics) {
      var attribute_lines, ctr, lower, my_items, my_lowers, my_uppers, upper, _i, _j, _len, _len2;
      if (lyrics.length === 0) {
        lyrics = '';
      }
      if (lowers.length === 0) {
        lowers = '';
      }
      if (uppers.length === 0) {
        uppers = '';
      }
      my_items = _.flatten(_.compact([uppers, sargam, lowers, lyrics]));
      ctr = 0;
      for (_i = 0, _len = uppers.length; _i < _len; _i++) {
        upper = uppers[_i];
        upper.group_line_no = ctr;
        ctr = ctr + 1;
        sargam.group_line_no = ctr;
        ctr = ctr + 1;
      }
      for (_j = 0, _len2 = lowers.length; _j < _len2; _j++) {
        lower = lowers[_j];
        lower.group_line_no = ctr;
        ctr = ctr + 1;
      }
      if (lyrics != null) {
        lyrics.group_line_no = ctr;
      }
      _.each(my_items, function(my_line) {
        return this.measure_columns(my_line.items, 0);
      });
      my_uppers = _.flatten(_.compact([uppers]));
      my_lowers = _.flatten(_.compact([lowers]));
      attribute_lines = _.flatten(_.compact([uppers, lowers, lyrics]));
      this.assign_attributes(sargam, attribute_lines);
      return sargam;
    },
    parse_composition: function(attributes, lines) {
      var title, to_string, x;
      if (attributes === "") {
        attributes = null;
      }
      title = "Untitled";
      this.log("in composition, attributes is");
      this.my_inspect(attributes);
      to_string = function() {
        var str, zz;
        zz = this.to_string;
        delete this.to_string;
        str = JSON.stringify(this, null, " ");
        this.to_string = zz;
        return "\n" + str;
      };
      this.composition_data = {
        my_type: "composition",
        title: title,
        filename: "untitled",
        attributes: attributes,
        lines: _.flatten(lines),
        warnings: this.warnings,
        source: "",
        toString: to_string
      };
      if (x = get_attribute("Key")) {
        this.composition_data.key = x;
      }
      if (x = get_attribute("Filename")) {
        this.composition_data.filename = x;
      }
      if (x = get_attribute("Title")) {
        this.composition_data.title = x;
      }
      this.mark_partial_measures();
      return this.composition_data;
    },
    parse_sargam_pitch: function(slur, musical_char, end_slur) {
      var attributes, source;
      source = '';
      attributes = [];
      if (slur !== '') {
        attributes.push(slur);
        source = source + slur.source;
      }
      source = source + musical_char.source;
      if (end_slur !== '') {
        attributes.push(end_slur);
        source = source + end_slur.source;
      }
      return {
        my_type: "pitch",
        normalized_pitch: musical_char.normalized_pitch,
        attributes: attributes,
        pitch_source: musical_char.source,
        source: source,
        octave: 0
      };
    },
    parse_beat_delimited: function(begin_symbol, beat_items, end_symbol) {
      var my_beat;
      beat_items.unshift(begin_symbol);
      beat_items.push(end_symbol);
      my_beat = {
        my_type: "beat",
        source: this.get_source_for_items(beat_items),
        items: beat_items
      };
      my_beat.subdivisions = this.count_beat_subdivisions(my_beat);
      this.log("count_beat_subdivisions returned", my_beat.subdivisions, "my beat was", my_beat);
      this.measure_note_durations(my_beat);
      return my_beat;
    },
    parse_beat_undelimited: function(beat_items) {
      var my_beat;
      beat_items = _.flatten(beat_items);
      my_beat = {
        my_type: "beat",
        source: this.get_source_for_items(beat_items),
        items: beat_items
      };
      my_beat.subdivisions = this.count_beat_subdivisions(my_beat);
      this.measure_note_durations(my_beat);
      return my_beat;
    },
    parse_ornament: function(items) {
      var beat_items, ornament;
      beat_items = _.flatten(items);
      ornament = {
        my_type: "ornament",
        id: ++this.id_ctr,
        source: this.get_source_for_items(items),
        ornament_items: items
      };
      return ornament;
    },
    parse_sargam_line: function(line_number, items, kind) {
      var my_items, my_line, source;
      if (line_number !== '') {
        items.unshift(line_number);
      }
      source = this.get_source_for_items(items);
      my_items = _.flatten(items);
      my_line = {
        line_number: line_number,
        my_type: "sargam_line",
        id: ++this.id_ctr,
        source: source,
        items: my_items,
        kind: kind
      };
      if (this.parens_unbalanced(my_line)) {
        this.log("unbalanced parens");
      }
      this.measure_dashes_at_beginning_of_beats(my_line);
      this.measure_pitch_durations(my_line);
      return my_line;
    },
    parse_measure: function(start_obs, items, end_obs) {
      var obj, source;
      if (start_obs !== "") {
        items.unshift(start_obs);
      }
      this.log("end.length is" + end_obs.length);
      if (end_obs !== "") {
        items.push(end_obs);
      }
      source = this.get_source_for_items(items);
      return obj = {
        my_type: "measure",
        id: ++this.id_ctr,
        source: source,
        items: items
      };
    },
    get_attribute: function(key) {
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
    },
    extract_lyrics: function() {
      var ary, item, sargam_line, _i, _j, _len, _len2, _ref, _ref2;
      ary = [];
      _ref = this.composition_data.lines;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sargam_line = _ref[_i];
        _ref2 = this.all_items(sargam_line, []);
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          item = _ref2[_j];
          this.log("extract_lyrics-item is", item);
          if (item.syllable) {
            ary.push(item.syllable);
          }
        }
      }
      return ary;
    },
    mark_partial_measures: function() {
      var beats, item, measure, measures, sargam_line, _i, _len, _ref, _results;
      _ref = this.composition_data.lines;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sargam_line = _ref[_i];
        this.log("processing " + sargam_line.source);
        measures = (function() {
          var _j, _len2, _ref2, _results2;
          _ref2 = sargam_line.items;
          _results2 = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            item = _ref2[_j];
            if (item.my_type === "measure") {
              _results2.push(item);
            }
          }
          return _results2;
        })();
        this.log('mark_partial_measures: measures', measures);
        _results.push((function() {
          var _j, _len2, _results2;
          _results2 = [];
          for (_j = 0, _len2 = measures.length; _j < _len2; _j++) {
            measure = measures[_j];
            beats = (function() {
              var _k, _len3, _ref2, _results3;
              _ref2 = measure.items;
              _results3 = [];
              for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
                item = _ref2[_k];
                if (item.my_type === "beat") {
                  _results3.push(item);
                }
              }
              return _results3;
            })();
            this.log('mark_partial_measures: beats is', beats);
            this.log('mark_partial_measures: beats.length ', beats.length);
            measure.beat_count = beats.length;
            _results2.push(measure.beat_count < 4 ? (this.log("setting is_partial true"), this.log("inside if"), measure.is_partial = true) : void 0);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    },
    measure_pitch_durations: function(line) {
      var last_pitch;
      this.log("measure_pitch_durations line is", line);
      last_pitch = null;
      return _.each(all_items(line), __bind(function(item) {
        var frac, my_funct;
        this.log("***measure_pitch_durations:item.my_type is", item.my_type);
        if (item.my_type === "measure") {
          this.log("***going into measure");
        }
        if (item.my_type === "pitch") {
          if (!(item.fraction_array != null)) {
            item.fraction_array = [];
          }
          frac = new Fraction(item.numerator, item.denominator);
          item.fraction_array.push(frac);
          last_pitch = item;
          this.my_inspect(item);
        }
        if (item.my_type === "dash" && item.dash_to_tie) {
          frac = new Fraction(item.numerator, item.denominator);
          last_pitch.fraction_array.push(frac);
          my_funct = function(memo, frac) {
            if (!(memo != null)) {
              return frac;
            } else {
              return frac.add(memo);
            }
          };
          return last_pitch.fraction_total = _.reduce(last_pitch.fraction_array, my_funct, null);
        }
      }, this));
    },
    measure_dashes_at_beginning_of_beats: function(line) {
      var all, beats, beats_with_dashes_at_start_of_beat, item, last_pitch, measures, _i, _len, _ref;
      this.log("measure_dashes line is", line);
      measures = (function() {
        var _i, _len, _ref, _results;
        _ref = line.items;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item.my_type === "measure") {
            _results.push(item);
          }
        }
        return _results;
      })();
      this.log("measure_dashes measures is", measures);
      beats = [];
      _.each(measures, __bind(function(measure) {
        var item, m_beats;
        m_beats = (function() {
          var _i, _len, _ref, _results;
          _ref = measure.items;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            if (item.my_type === 'beat') {
              _results.push(item);
            }
          }
          return _results;
        })();
        return beats = beats.concat(m_beats);
      }, this));
      this.log("measure_dashes - beasts is", beats);
      beats_with_dashes_at_start_of_beat = _.select(beats, __bind(function(beat) {
        var item, pitch_dashes;
        pitch_dashes = (function() {
          var _i, _len, _ref, _results;
          _ref = beat.items;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            if (item.my_type === "dash" || item.my_type === "pitch") {
              _results.push(item);
            }
          }
          return _results;
        })();
        this.log("pitch_dashes", pitch_dashes);
        if (pitch_dashes.length === 0) {
          return false;
        }
        if (pitch_dashes[0].my_type === "dash") {
          return true;
        }
      }, this));
      this.log("measure_dashes ;beats_with_dashes_at_start_of_beat =", beats_with_dashes_at_start_of_beat);
      _.each(beats_with_dashes_at_start_of_beat, __bind(function(my_beat) {
        var ctr, denominator, done, first_dash;
        denominator = my_beat.subdivisions;
        done = false;
        ctr = 0;
        first_dash = null;
        _.each(my_beat.items, __bind(function(item) {
          if (done) {
            return;
          }
          done = item.my_type === "pitch";
          if (item.my_type === "dash") {
            ctr++;
            if (ctr === 1) {
              return first_dash = item;
            }
          }
        }, this));
        first_dash.numerator = ctr;
        first_dash.denominator = denominator;
        return first_dash.dash_to_tie = true;
      }, this));
      this.log("looping through items");
      last_pitch = null;
      all = [];
      _ref = this.all_items(line, all);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        this.log("in loop,item is", item);
        if (item.my_type === "pitch") {
          last_pitch = item;
        }
        if (item.dash_to_tie && (last_pitch != null)) {
          last_pitch.tied = true;
          item.pitch_to_use_for_tie = last_pitch;
          last_pitch = item;
        }
        if (item.dash_to_tie && !(last_pitch != null)) {
          item.rest = true;
          item.dash_to_tie = false;
        }
      }
    },
    measure_note_durations: function(beat) {
      var ctr, denominator, len, microbeats, _results;
      denominator = beat.subdivisions;
      microbeats = 0;
      len = beat.items.length;
      ctr = 0;
      _results = [];
      for (ctr = 0; 0 <= len ? ctr < len : ctr > len; 0 <= len ? ctr++ : ctr--) {
        _results.push(__bind(function(ctr) {
          var done, item, numerator, x, _fn, _ref, _ref2;
          item = beat.items[ctr];
          this.log("in do loop, item is " + item.source);
          this.log("in do loop, ctr is " + ctr);
          if (item.my_type !== "pitch") {
            return;
          }
          this.log("setting denominator for " + item.source);
          numerator = 1;
          done = false;
          if (ctr < len) {
            _fn = __bind(function(x) {
              var my_item;
              if (x < len) {
                this.log('x is' + x);
                if (!done) {
                  my_item = beat.items[x];
                  if (my_item.my_type === "dash") {
                    numerator++;
                  }
                  if (my_item.my_type === "pitch") {
                    done = true;
                  }
                  this.log("in inner loop, my_item is" + my_item.source);
                  return this.log("in inner loop, x is" + x);
                }
              }
            }, this);
            for (x = _ref = ctr + 1, _ref2 = len - 1; _ref <= _ref2 ? x <= _ref2 : x >= _ref2; _ref <= _ref2 ? x++ : x--) {
              _fn(x);
            }
          }
          this.log("setting numerator,denominator for " + item.source);
          item.numerator = numerator;
          return item.denominator = denominator;
        }, this)(ctr));
      }
      return _results;
    },
    count_beat_subdivisions: function(beat) {
      this.log("all_items", all_items(beat));
      return (_.select(all_items(beat), function(item) {
        return item.my_type === "pitch" || item.my_type === "dash";
      })).length;
    },
    item_has_attribute: function(item, attr_name) {
      if (!(item.attributes != null)) {
        return false;
      }
      return _.detect(item.attributes, function(attr) {
        if (!(attr.my_type != null)) {
          return false;
        }
        return attr.my_type === attr_name;
      });
    },
    parens_unbalanced: function(line) {
      var ary, x, y;
      this.log("entering parens_unbalanced");
      ary = this.collect_nodes(line, []);
      this.log("ary is");
      this.my_inspect(ary);
      x = _.select(ary, __bind(function(item) {
        return this.item_has_attribute(item, 'begin_slur');
      }, this));
      y = _.select(ary, __bind(function(item) {
        return this.item_has_attribute(item, 'end_slur');
      }, this));
      if (x.length !== y.length) {
        this.warnings.push("Error on line ? unbalanced parens, line was " + line.source + " Note that parens are used for slurs and should bracket pitches as so (S--- R)--- and NOT  (S--) ");
        return true;
      }
      return false;
    },
    get_source_for_items: function(items) {
      var str;
      str = '';
      _.each(items, __bind(function(item) {
        if (!(item.source != null)) {
          return;
        }
        return str = str + item.source;
      }, this));
      return str;
    },
    measure_columns: function(items, pos) {
      return _.each(items, __bind(function(item) {
        item.column = pos;
        if ((item.my_type === "pitch") && (item.source[0] === "(")) {
          item.column = item.column + 1;
        }
        if ((item.my_type === "pitch") && (item.source[item.source.length] === ")")) {
          item.column = item.column - 1;
        }
        if (item.items != null) {
          this.measure_columns(item.items, pos);
        }
        return pos = pos + item.source.length;
      }, this));
    },
    handle_ornament: function(sargam, sarg_obj, ornament, sargam_nodes) {
      var s;
      console.log("handle_ornament");
      s = sargam_nodes[ornament.column + ornament.source.length];
      if ((s != null) && (s.my_type === "pitch")) {
        console.log("handle_ornament, before case, s is " + s);
        ornament.placement = "before";
        if (!(s.attributes != null)) {
          s.attributes = [];
        }
        s.attributes.push(ornament);
        console.log("handle_ornament");
        return;
      }
      s = sargam_nodes[ornament.column - 1];
      if ((s != null) && (s.my_type === "pitch")) {
        ornament.placement = "after";
        if (!(s.attributes != null)) {
          s.attributes = [];
        }
        s.attributes.push(ornament);
        return;
      }
      return this.warnings.push("ornament " + ornament.my_type + " (" + ornament.source + ") not to right of pitch , column is " + ornament.column);
    },
    check_semantics: function(sargam, sarg_obj, attribute, sargam_nodes) {
      var srgmpdn_in_devanagri;
      if (attribute.my_type === "whitespace") {
        return false;
      }
      if (attribute.my_type === "ornament") {
        handle_ornament(sargam, sarg_obj, attribute, sargam_nodes);
        return false;
      }
      if (!sarg_obj) {
        this.warnings.push("Attribute " + attribute.my_type + " (" + attribute.source + ") above/below nothing, column is " + attribute.column);
        return false;
      }
      if (attribute.my_type === "kommal_indicator") {
        srgmpdn_in_devanagri = "\u0938\u0930\u095A\u092E\u092a\u0927";
        if (srgmpdn_in_devanagri.indexOf(sarg_obj.source) > -1) {
          sarg_obj.normalized_pitch = sarg_obj.normalized_pitch + "b";
          return true;
        }
        this.warnings.push("Error on line ?, column " + sarg_obj.column + ("kommal indicator below non-devanagri pitch. Type of obj was " + sarg_obj.my_type + ". sargam line was:") + sargam.source);
        return false;
      }
      if (attribute.octave != null) {
        if (sarg_obj.my_type !== 'pitch') {
          this.warnings.push("Error on line ?, column " + sarg_obj.column + ("" + attribute.my_type + " below non-pitch. Type of obj was " + sarg_obj.my_type + ". sargam line was:") + sargam.source);
          return false;
        }
        sarg_obj.octave = attribute.octave;
        return false;
      }
      if (attribute.syllable != null) {
        if (sarg_obj.my_type !== 'pitch') {
          this.warnings.push("Error on line ?, column " + sarg_obj.column + ("syllable " + attribute.syllable + " below non-pitch. Type of obj was " + sarg_obj.my_type + ". sargam line was:") + sargam.source);
          return false;
        }
        sarg_obj.syllable = attribute.syllable;
        return false;
      }
      return true;
    },
    find_ornaments: function(attribute_lines) {
      var item, line, orn_item, orns, _i, _j, _k, _len, _len2, _len3, _ref, _ref2;
      orns = [];
      for (_i = 0, _len = attribute_lines.length; _i < _len; _i++) {
        line = attribute_lines[_i];
        _ref = line.items;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          item = _ref[_j];
          if (item.my_type === "ornament") {
            item.group_line_no = line.group_line_no;
            _ref2 = item.ornament_items;
            for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
              orn_item = _ref2[_k];
              orn_item.group_line_no = line.group_line_no;
            }
            orns.push(item);
          }
        }
      }
      return orns;
    },
    map_ornaments: function(ornaments) {
      var column, map, orn, ornament_item, _i, _j, _len, _len2, _ref;
      map = {};
      for (_i = 0, _len = ornaments.length; _i < _len; _i++) {
        orn = ornaments[_i];
        _.debug(orn);
        column = orn.column;
        _ref = orn.ornament_items;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          ornament_item = _ref[_j];
          map[column] = ornament_item;
          column = column + 1;
        }
      }
      return map;
    },
    assign_attributes: function(sargam, attribute_lines) {
      var attribute, attribute_line, attribute_map, attribute_nodes, column, ornament_nodes, ornaments, sargam_nodes, _i, _len, _results;
      this.log("entering assign_attributes=sargam,attribute_lines", sargam, attribute_lines);
      sargam_nodes = this.map_nodes(sargam);
      ornaments = this.find_ornaments(attribute_lines);
      _.debug("assign_attributes:ornaments are: " + ornaments);
      ornament_nodes = this.map_ornaments(ornaments);
      _.debug("in assign_attributes ornament nodes: " + ornament_nodes);
      _results = [];
      for (_i = 0, _len = attribute_lines.length; _i < _len; _i++) {
        attribute_line = attribute_lines[_i];
        this.log("processing", attribute_line);
        attribute_map = {};
        attribute_nodes = this.map_nodes(attribute_line);
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (column in attribute_nodes) {
            attribute = attribute_nodes[column];
            _results2.push(__bind(function(column, attribute) {
              var orn_obj, sarg_obj;
              this.log("processing column,attribute", column, attribute);
              sarg_obj = sargam_nodes[column];
              orn_obj = ornament_nodes[column];
              if (orn_obj != null) {
                if (attribute.my_type === "upper_octave_indicator") {
                  orn_obj.octave = 1;
                  _.debug("assign_attributes:upper_octave_indicator case", attribute);
                  if (orn_obj.group_line_no < attribute_line.group_line_no) {
                    attribute.my_type = "lower_octave_indicator";
                    orn_obj.octave = orn_obj.octave * -1;
                  }
                  if (!(orn_obj.attributes != null)) {
                    orn_obj.attributes = [];
                  }
                  orn_obj.attributes.push(attribute);
                  return;
                }
              }
              if (this.check_semantics(sargam, sarg_obj, attribute, sargam_nodes) === !false) {
                if (!(sarg_obj.attributes != null)) {
                  sarg_obj.attributes = [];
                }
                return sarg_obj.attributes.push(attribute);
              }
            }, this)(column, attribute));
          }
          return _results2;
        }).call(this));
      }
      return _results;
    },
    collect_nodes: function(obj, ary) {
      if ((obj.my_type != null) && !(obj.items != null)) {
        ary.push(obj);
      }
      if (obj.items != null) {
        _.each(obj.items, __bind(function(my_obj) {
          if (my_obj.my_type != null) {
            ary.push(my_obj);
          }
          if (my_obj.items != null) {
            return this.collect_nodes(my_obj, ary);
          }
        }, this));
      }
      this.my_inspect("leaving collect_nodes, ary is ");
      this.my_inspect(ary);
      return ary;
    },
    map_nodes: function(obj, map) {
      if (map == null) {
        map = {};
      }
      this.my_inspect("Entering map_nodes, map is ");
      this.my_inspect(map);
      this.log("obj.column is ");
      this.my_inspect(obj.column);
      if (obj.column != null) {
        map[obj.column] = obj;
      }
      if (obj.items != null) {
        _.each(obj.items, __bind(function(my_obj) {
          this.log("my_obj.column is ");
          if (my_obj.column != null) {
            map[my_obj.column] = my_obj;
          }
          if (my_obj.items != null) {
            return this.map_nodes(my_obj, map);
          }
        }, this));
      }
      return map;
    },
    log: function(x) {
      var arg, _i, _len, _results;
      if (!(this.debug != null)) {
        return;
      }
      if (!this.debug) {
        return;
      }
      if (!(typeof console !== "undefined" && console !== null)) {
        return;
      }
      if (!(console.log != null)) {
        return;
      }
      _results = [];
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        arg = arguments[_i];
        _results.push(console ? console.log(arg) : void 0);
      }
      return _results;
    },
    running_under_node: function() {
      return false;
    },
    my_inspect: function(obj) {
      if (!(debug != null)) {
        return;
      }
      if (!debug) {
        return;
      }
      if (!(typeof console !== "undefined" && console !== null)) {
        return;
      }
      if (!(console.log != null)) {
        return;
      }
      if (typeof sys !== "undefined" && sys !== null) {
        console.log(sys.inspect(obj, false, null));
        return;
      }
      return console.log(obj);
    }
  };
}).call(this);
