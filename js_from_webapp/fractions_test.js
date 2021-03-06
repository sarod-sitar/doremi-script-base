(function() {
  var Fraction, debug, root, sys;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  /*
     Quick test of fractions.js
  */
  debug = false;
  if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
    sys = require('util');
    Fraction = require('./third_party/fraction.js').Fraction;
  }
  exports.test_fractions_constructor_reduces_improper_fractions = function(test) {
    var fraction;
    fraction = new Fraction(2, 4);
    test.equal(fraction.numerator, 1);
    test.equal(fraction.denominator, 2);
    return test.done();
  };
}).call(this);
