(function() {
  var debug, denoms, find_denom, lookup, root, to_western_rhythm, _;
  debug = true;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  if (typeof require !== "undefined" && require !== null) {
    _ = require("underscore")._;
  }
  lookup = {
    "1/1": [
      {
        note: "quarter"
      }
    ],
    "1/2": [
      {
        note: "eighth"
      }
    ],
    "1/3": [
      {
        note: "eighth"
      }
    ],
    "2/3": [
      {
        note: "quarter"
      }
    ],
    "1/4": [
      {
        note: "sixteenth"
      }
    ],
    "2/4": [
      {
        note: "eighth"
      }
    ],
    "3/4": [
      {
        note: "eighth",
        dots: 1
      }
    ],
    "4/4": [
      {
        note: "quarter"
      }
    ],
    "1/8": [
      {
        note: "thirty_second"
      }
    ],
    "2/8": [
      {
        note: "sixteenth"
      }
    ],
    "3/8": [
      {
        note: "sixteenth",
        dots: 1
      }
    ],
    "4/8": [
      {
        note: "eighth"
      }
    ],
    "5/8": [
      {
        note: "eighth"
      }, {
        note: "thirty_second"
      }
    ],
    "6/8": [
      {
        note: "eighth",
        dots: 1
      }
    ],
    "7/8": [
      {
        note: "eighth",
        dots: 2
      }
    ],
    "8/8": [
      {
        note: "quarter"
      }
    ],
    "1/16": [
      {
        note: "sixty_fourth"
      }
    ],
    "2/16": [
      {
        note: "thirty_second"
      }
    ],
    "3/16": [
      {
        note: "thirty_second",
        dots: 1
      }
    ],
    "4/16": [
      {
        note: "eighth"
      }
    ],
    "5/16": [
      {
        note: "sixteenth"
      }, {
        note: "sixty_fourth"
      }
    ],
    "6/16": [
      {
        note: "eighth",
        dots: 1
      }
    ],
    "7/16": [
      {
        note: "sixteenth",
        dots: 1
      }
    ],
    "8/16": [
      {
        note: "eighth"
      }
    ],
    "9/16": [
      {
        note: "eighth"
      }, {
        note: "sixty_fourth"
      }
    ],
    "10/16": [
      {
        note: "eighth"
      }, {
        note: "thirty_second"
      }
    ],
    "11/16": [
      {
        note: "eighth"
      }, {
        note: "thirty_second",
        dots: 1
      }
    ],
    "12/16": [
      {
        note: "eighth",
        dots: 1
      }
    ],
    "13/16": [
      {
        note: "eighth"
      }, {
        note: "sixteenth"
      }, {
        note: "sixty_fourth"
      }
    ],
    "14/16": [
      {
        note: "eighth",
        dots: 2
      }
    ],
    "15/16": [
      {
        note: "eighth",
        dots: 3
      }
    ],
    "1/32": [128],
    "2/32": [
      {
        note: "sixty_fourth"
      }
    ],
    "3/32": [
      {
        note: "sixty_fourth",
        dots: 1
      }
    ],
    "4/32": [
      {
        note: "sixteenth"
      }
    ],
    "5/32": [
      {
        note: "sixteenth"
      }, {
        note: "one_twenty_eighth"
      }
    ],
    "6/32": [
      {
        note: "thirty_second",
        dots: 1
      }
    ],
    "2/1": [
      {
        note: "half"
      }
    ],
    "3/1": [
      {
        note: "half",
        dots: 1
      }
    ],
    "4/1": [
      {
        note: "whole"
      }
    ]
  };
  denoms = [32, 16, 8, 4, 2, 1];
  find_denom = function(val, list) {
    if (list == null) {
      list = denoms;
    }
    console.log(denoms);
    return _.detect(denoms, function(x) {
      return val >= x;
    });
  };
  to_western_rhythm = function(numerator, denominator) {
    var denom;
    denom = find_denom(denominator);
    console.log("denom", denom);
    console.log("numerator", numerator);
    return lookup["" + numerator + "/" + denom];
  };
  root.to_western_rhythm = to_western_rhythm;
  root.find_denom = find_denom;
}).call(this);
