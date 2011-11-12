(function() {
  var debug, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  debug = false;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  root.ParserHelper = {
    sa_helper: function(source, normalized) {
      var obj;
      obj = {
        source: source,
        normalized_pitch: normalized
      };
      return obj;
    },
    parse_sargam_pitch: function(slur, musical_char, end_slur) {
      var attributes, source;
      source = musical_char.source;
      attributes = [];
      if (slur !== '') {
        source = slur.source + source;
        attributes.push(slur);
      }
      if (end_slur !== '') {
        source = source + end_slur.source;
        attributes.push(end_slur);
      }
      return {
        my_type: "pitch",
        normalized_pitch: musical_char.normalized_pitch,
        attributes: attributes,
        source: source,
        pitch_source: musical_char.source,
        begin_slur: slur !== '',
        end_slur: end_slur !== '',
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
    parse_sargam_line: function(line_number, items) {
      var my_items, my_line, source;
      if (line_number !== '') {
        items.unshift(line_number);
      }
      source = this.get_source_for_items(items);
      my_items = _.flatten(items);
      my_line = {
        line_number: line_number,
        my_type: "sargam_line",
        source: source,
        items: my_items,
        kind: "latin_sargam"
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
      var ary, item, logical_line, _i, _j, _len, _len2, _ref, _ref2;
      ary = [];
      _ref = this.composition_data.logical_lines;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        logical_line = _ref[_i];
        _ref2 = this.all_items(logical_line.sargam_line, []);
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
      var beats, item, logical_line, measure, measures, _i, _len, _ref, _results;
      _ref = this.composition_data.logical_lines;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        logical_line = _ref[_i];
        this.log("processing " + logical_line.sargam_line.source);
        measures = (function() {
          var _j, _len2, _ref2, _results2;
          _ref2 = logical_line.sargam_line.items;
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
        var frac;
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
          return last_pitch.fraction_array.push(frac);
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
    parens_unbalanced: function(line) {
      var ary, x, y;
      this.log("entering parens_unbalanced");
      ary = [];
      ary = this.collect_nodes(line, ary);
      this.log("ary is");
      this.my_inspect(ary);
      x = _.select(ary, __bind(function(item) {
        return (item.begin_slur != null) && item.begin_slur === true;
      }, this));
      y = _.select(ary, __bind(function(item) {
        return (item.end_slur != null) && item.end_slur === true;
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
    check_semantics: function(sargam, sarg_obj, attribute) {
      var srgmpdn_in_devanagri;
      if (attribute.my_type === "whitespace") {
        return false;
      }
      if (!sarg_obj) {
        this.warnings.push("Attribute " + attribute.my_type + " above/below nothing, column is " + attribute.column);
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
          this.warnings.push("Error on line ?, column " + sarg_obj.column + ("lower octave indicator below non-pitch. Type of obj was " + sarg_obj.my_type + ". sargam line was:") + sargam.source);
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
    assign_attributes: function(sargam, attribute_lines) {
      var attribute, attribute_line, attribute_map, attribute_nodes, column, sarg_obj, sargam_nodes, _i, _len, _results;
      this.log("entering assign_attributes=sargam,attribute_lines", sargam, attribute_lines);
      sargam_nodes = this.map_nodes(sargam);
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
            this.log("processing column,attribute", column, attribute);
            sarg_obj = sargam_nodes[column];
            _results2.push(this.check_semantics(sargam, sarg_obj, attribute) === !false ? (!(sarg_obj.attributes != null) ? sarg_obj.attributes = [] : void 0, sarg_obj.attributes.push(attribute)) : void 0);
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
