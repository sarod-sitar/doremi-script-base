(function() {
  var Composition, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  Composition = (function() {
    Composition.prototype.first_sargam_line = function() {
      return this.composition_data.logical_lines[0].sargam_line;
    };
    Composition.prototype.first_logical_line = function() {
      return this.composition_data.logical_lines[0];
    };
    function Composition() {
      this.composition_data = {};
      this.warnings = [];
    }
    Composition.prototype.set_composition_data = function(some_composition_data) {
      return this.composition_data = some_composition_data;
    };
    Composition.prototype.extract_lyrics = function() {
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
    Composition.prototype.tie_notes = function() {};
    Composition.prototype.get_attribute = function(key) {
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
    Composition.prototype.mark_partial_measures = function() {
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
    };
    Composition.prototype.all_items_in_line = function(line_or_item, items) {
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
    Composition.prototype.measure_dashes_at_beginning_of_beats = function(line) {
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
      _ref = this.all_items_in_line(line, all);
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
    };
    Composition.prototype.measure_note_durations = function(beat) {
      var ctr, denominator, len, microbeats, _results;
      this.log("entering measure_note_durations for beat:" + beat.source);
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
    };
    Composition.prototype.count_beat_subdivisions = function(beat) {
      return (_.select(beat.items, function(item) {
        return item.my_type === "pitch" || item.my_type === "dash";
      })).length;
    };
    Composition.prototype.parens_unbalanced = function(line) {
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
    };
    Composition.prototype.get_source_for_items = function(items) {
      var str;
      str = '';
      _.each(items, __bind(function(item) {
        if (!(item.source != null)) {
          return;
        }
        return str = str + item.source;
      }, this));
      return str;
    };
    Composition.prototype.measure_columns = function(items, pos) {
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
    };
    Composition.prototype.assign_from_upper = function(obj, upper) {
      var ok, sargam, sargam_map, upper_map;
      this.log("entering assign_from_upper obj=");
      this.my_inspect(obj);
      ok = true;
      sargam = obj.sargam_line;
      this.log("sargam is");
      this.my_inspect(sargam);
      sargam_map = this.map_nodes(sargam);
      this.log(sargam_map);
      upper_map = this.map_nodes(upper);
      this.my_inspect(upper_map);
      _.each(upper_map, __bind(function(node, column) {
        var sarg_obj;
        this.log("node.my_type =", node.my_type);
        if (node.my_type === "whitespace") {
          return;
        }
        sarg_obj = sargam_map[column];
        if (!(sarg_obj != null)) {
          this.warnings.push("Error on line ?, column " + column + " " + node.my_type + node.source + " above nothing. sargam line was:" + sargam.source);
          ok = false;
          return false;
        }
        if (!(sarg_obj.attributes != null)) {
          sarg_obj.attributes = [];
        }
        sarg_obj.attributes.push(node);
        if (node.octave != null) {
          return sarg_obj.octave = node.octave;
        }
      }, this));
      this.log("map_nodes returned");
      this.my_inspect(sargam_map);
      return ok;
    };
    Composition.prototype.assign_from_lyrics = function(obj) {
      var lyric_nodes, lyrics, lyrics_map, ok, sargam, sargam_map, sargam_nodes;
      ok = true;
      if (!(obj.lyrics != null)) {
        return ok;
      }
      lyrics = obj.lyrics;
      sargam = obj.sargam_line;
      sargam_map = {};
      lyrics_map = {};
      sargam_nodes = this.map_nodes(sargam, sargam_map);
      lyric_nodes = this.map_nodes(lyrics, lyrics_map);
      _.each(lyrics_map, __bind(function(node, column) {
        var sarg_obj;
        this.log("node,column =", node, column);
        sarg_obj = sargam_map[column];
        this.log("sarg_obj is");
        this.my_inspect(sarg_obj);
        this.my_inspect(node);
        if (node.syllable != null) {
          if ((!(sarg_obj != null)) || (sarg_obj.my_type !== "pitch")) {
            ok = false;
            this.warnings.push("Error on line ?, column " + column + ("syllable " + node.syllable + " below non-pitch. sargam line was:") + sargam.source);
            return ok;
          }
          return sarg_obj.syllable = node.syllable;
        }
      }, this));
      this.log("map_nodes returned");
      this.my_inspect(sargam_nodes);
      return ok;
    };
    Composition.prototype.assign_from_lower = function(obj) {
      var lower, lower_map, lower_nodes, ok, sargam, sargam_map, sargam_nodes;
      ok = true;
      if (!(obj.lower != null)) {
        return ok;
      }
      lower = obj.lower;
      sargam = obj.sargam_line;
      sargam_map = {};
      lower_map = {};
      sargam_nodes = this.map_nodes(sargam, sargam_map);
      lower_nodes = this.map_nodes(lower, lower_map);
      _.each(lower_map, __bind(function(node, column) {
        var sarg_obj;
        this.log("node,column =", node, column);
        sarg_obj = sargam_map[column];
        this.log("sarg_obj is");
        this.my_inspect(sarg_obj);
        if (node.octave != null) {
          if (!(sarg_obj != null)) {
            ok = false;
            this.warnings.push("Error on line ?, column " + column + ("lower octave indicator below non-pitch(no object at column " + column + "). sargam line was:") + sargam.source);
            return false;
          }
          if (sarg_obj.my_type !== 'pitch') {
            this.warnings.push("Error on line ?, column " + column + ("lower octave indicator below non-pitch. Type of obj was " + sarg_obj.my_type + ". sargam line was:") + sargam.source);
            return false;
          }
          return sarg_obj.octave = node.octave;
        }
      }, this));
      this.my_inspect(sargam_nodes);
      return true;
    };
    Composition.prototype.collect_nodes = function(obj, ary) {
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
    };
    Composition.prototype.map_nodes = function(obj, map) {
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
    };
    Composition.prototype.log = function(x) {
      if (!(typeof console !== "undefined" && console !== null)) {
        return;
      }
      if (!(console.log != null)) {
        return;
      }
      if (console) {
        return console.log(x);
      }
    };
    Composition.prototype.running_under_node = function() {
      return (typeof module !== "undefined" && module !== null) && module.exports;
    };
    Composition.prototype.my_inspect = function(obj) {
      if (!(typeof console !== "undefined" && console !== null)) {
        return;
      }
      if (!(console.log != null)) {
        return;
      }
      if ((typeof window !== "undefined" && window !== null) && window.debug === false) {
        return;
      }
      if (!(root.debug != null)) {
        return;
      }
      if (this.running_under_node()) {
        console.log(sys.inspect(obj, false, null));
        return;
      }
      return console.log(obj);
    };
    return Composition;
  })();
  root.Composition = Composition;
}).call(this);
