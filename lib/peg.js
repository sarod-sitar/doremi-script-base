/* PEG.js 0.6.2 (http://pegjs.majda.cz/) */

(function(undefined) {

var PEG = {
  /* PEG.js version. */
  VERSION: "0.6.2",

  /*
   * Generates a parser from a specified grammar and returns it.
   *
   * The grammar must be a string in the format described by the metagramar in
   * the parser.pegjs file.
   *
   * Throws |PEG.parser.SyntaxError| if the grammar contains a syntax error or
   * |PEG.GrammarError| if it contains a semantic error. Note that not all
   * errors are detected during the generation and some may protrude to the
   * generated parser and cause its malfunction.
   */
  buildParser: function(grammar) {
    return PEG.compiler.compile(PEG.parser.parse(grammar));
  }
};

/* Thrown when the grammar contains an error. */

PEG.GrammarError = function(message) {
  this.name = "PEG.GrammarError";
  this.message = message;
};

PEG.GrammarError.prototype = Error.prototype;

/* Like Python's |range|, but without |step|. */
function range(start, stop) {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }

  var result = new Array(Math.max(0, stop - start));
  for (var i = 0, j = start; j < stop; i++, j++) {
    result[i] = j;
  }
  return result;
}

function contains(array, value) {
  /*
   * Stupid IE does not have Array.prototype.indexOf, otherwise this function
   * would be a one-liner.
   */
  var length = array.length;
  for (var i = 0; i < length; i++) {
    if (array[i] === value) {
      return true;
    }
  }
  return false;
}

function each(array, callback) {
  var length = array.length;
  for (var i = 0; i < length; i++) {
    callback(array[i], i);
  }
}

function map(array, callback) {
  var result = [];
  var length = array.length;
  for (var i = 0; i < length; i++) {
    result[i] = callback(array[i], i);
  }
  return result;
}

/*
 * Returns a string padded on the left to a desired length with a character.
 *
 * The code needs to be in sync with the code template in the compilation
 * function for "action" nodes.
 */
function padLeft(input, padding, length) {
  var result = input;

  var padLength = length - input.length;
  for (var i = 0; i < padLength; i++) {
    result = padding + result;
  }

  return result;
}

/*
 * Returns an escape sequence for given character. Uses \x for characters <=
 * 0xFF to save space, \u for the rest.
 *
 * The code needs to be in sync with the code template in the compilation
 * function for "action" nodes.
 */
function escape(ch) {
  var charCode = ch.charCodeAt(0);
  var escapeChar;
  var length;

  if (charCode <= 0xFF) {
    escapeChar = 'x';
    length = 2;
  } else {
    escapeChar = 'u';
    length = 4;
  }

  return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
}

/*
 * Surrounds the string with quotes and escapes characters inside so that the
 * result is a valid JavaScript string.
 *
 * The code needs to be in sync with the code template in the compilation
 * function for "action" nodes.
 */
function quote(s) {
  /*
   * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a string
   * literal except for the closing quote character, backslash, carriage return,
   * line separator, paragraph separator, and line feed. Any character may
   * appear in the form of an escape sequence.
   *
   * For portability, we also escape escape all control and non-ASCII
   * characters. Note that "\0" and "\v" escape sequences are not used because
   * JSHint does not like the first and IE the second.
   */
  return '"' + s
    .replace(/\\/g, '\\\\')  // backslash
    .replace(/"/g, '\\"')    // closing quote character
    .replace(/\x08/g, '\\b') // backspace
    .replace(/\t/g, '\\t')   // horizontal tab
    .replace(/\n/g, '\\n')   // line feed
    .replace(/\f/g, '\\f')   // form feed
    .replace(/\r/g, '\\r')   // carriage return
    .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
    + '"';
}

/*
 * Escapes characters inside the string so that it can be used as a list of
 * characters in a character class of a regular expression.
 */
function quoteForRegexpClass(s) {
  /*
   * Based on ECMA-262, 5th ed., 7.8.5 & 15.10.1.
   *
   * For portability, we also escape escape all control and non-ASCII
   * characters.
   */
  return s
    .replace(/\\/g, '\\\\')  // backslash
    .replace(/\//g, '\\/')   // closing slash
    .replace(/\]/g, '\\]')   // closing bracket
    .replace(/-/g, '\\-')    // dash
    .replace(/\0/g, '\\0')   // null, IE needs this
    .replace(/\t/g, '\\t')   // horizontal tab
    .replace(/\n/g, '\\n')   // line feed
    .replace(/\v/g, '\\x0B') // vertical tab
    .replace(/\f/g, '\\f')   // form feed
    .replace(/\r/g, '\\r')   // carriage return
    .replace(/[\x01-\x08\x0E-\x1F\x80-\uFFFF]/g, escape);
}

/*
 * Builds a node visitor -- a function which takes a node and any number of
 * other parameters, calls an appropriate function according to the node type,
 * passes it all its parameters and returns its value. The functions for various
 * node types are passed in a parameter to |buildNodeVisitor| as a hash.
 */
function buildNodeVisitor(functions) {
  return function(node) {
    return functions[node.type].apply(null, arguments);
  };
}
PEG.parser = (function(){
  /* Generated by PEG.js 0.6.2 (http://pegjs.majda.cz/). */
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "__": parse___,
        "action": parse_action,
        "and": parse_and,
        "braced": parse_braced,
        "bracketDelimitedCharacter": parse_bracketDelimitedCharacter,
        "choice": parse_choice,
        "class": parse_class,
        "classCharacter": parse_classCharacter,
        "classCharacterRange": parse_classCharacterRange,
        "colon": parse_colon,
        "comment": parse_comment,
        "digit": parse_digit,
        "dot": parse_dot,
        "doubleQuotedCharacter": parse_doubleQuotedCharacter,
        "doubleQuotedString": parse_doubleQuotedString,
        "eol": parse_eol,
        "eolChar": parse_eolChar,
        "eolEscapeSequence": parse_eolEscapeSequence,
        "equals": parse_equals,
        "grammar": parse_grammar,
        "hexDigit": parse_hexDigit,
        "hexEscapeSequence": parse_hexEscapeSequence,
        "identifier": parse_identifier,
        "initializer": parse_initializer,
        "labeled": parse_labeled,
        "letter": parse_letter,
        "literal": parse_literal,
        "lowerCaseLetter": parse_lowerCaseLetter,
        "lparen": parse_lparen,
        "multiLineComment": parse_multiLineComment,
        "nonBraceCharacter": parse_nonBraceCharacter,
        "nonBraceCharacters": parse_nonBraceCharacters,
        "not": parse_not,
        "plus": parse_plus,
        "prefixed": parse_prefixed,
        "primary": parse_primary,
        "question": parse_question,
        "rparen": parse_rparen,
        "rule": parse_rule,
        "semicolon": parse_semicolon,
        "sequence": parse_sequence,
        "simpleBracketDelimitedCharacter": parse_simpleBracketDelimitedCharacter,
        "simpleDoubleQuotedCharacter": parse_simpleDoubleQuotedCharacter,
        "simpleEscapeSequence": parse_simpleEscapeSequence,
        "simpleSingleQuotedCharacter": parse_simpleSingleQuotedCharacter,
        "singleLineComment": parse_singleLineComment,
        "singleQuotedCharacter": parse_singleQuotedCharacter,
        "singleQuotedString": parse_singleQuotedString,
        "slash": parse_slash,
        "star": parse_star,
        "string": parse_string,
        "suffixed": parse_suffixed,
        "unicodeEscapeSequence": parse_unicodeEscapeSequence,
        "upperCaseLetter": parse_upperCaseLetter,
        "whitespace": parse_whitespace,
        "zeroEscapeSequence": parse_zeroEscapeSequence
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "grammar";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      var cache = {};
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function quote(s) {
        /*
         * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
         * string literal except for the closing quote character, backslash,
         * carriage return, line separator, paragraph separator, and line feed.
         * Any character may appear in the form of an escape sequence.
         *
         * For portability, we also escape escape all control and non-ASCII
         * characters. Note that "\0" and "\v" escape sequences are not used
         * because JSHint does not like the first and IE the second.
         */
        return '"' + s
          .replace(/\\/g, '\\\\')  // backslash
          .replace(/"/g, '\\"')    // closing quote character
          .replace(/\x08/g, '\\b') // backspace
          .replace(/\t/g, '\\t')   // horizontal tab
          .replace(/\n/g, '\\n')   // line feed
          .replace(/\f/g, '\\f')   // form feed
          .replace(/\r/g, '\\r')   // carriage return
          .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
          + '"';
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_grammar() {
        var cacheKey = "grammar@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse___();
        if (result0 !== null) {
          result1 = parse_initializer();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result3 = parse_rule();
            if (result3 !== null) {
              result2 = [];
              while (result3 !== null) {
                result2.push(result3);
                result3 = parse_rule();
              }
            } else {
              result2 = null;
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(initializer, rules) {
              var rulesConverted = {};
              each(rules, function(rule) { rulesConverted[rule.name] = rule; });
        
              return {
                type:        "grammar",
                initializer: initializer !== "" ? initializer : null,
                rules:       rulesConverted,
                startRule:   rules[0].name
              };
            })(result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_initializer() {
        var cacheKey = "initializer@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_action();
        if (result0 !== null) {
          result1 = parse_semicolon();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(code) {
              return {
                type: "initializer",
                code: code
              };
            })(result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_rule() {
        var cacheKey = "rule@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_identifier();
        if (result0 !== null) {
          result1 = parse_string();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_equals();
            if (result2 !== null) {
              result3 = parse_choice();
              if (result3 !== null) {
                result4 = parse_semicolon();
                result4 = result4 !== null ? result4 : "";
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(name, displayName, expression) {
              return {
                type:        "rule",
                name:        name,
                displayName: displayName !== "" ? displayName : null,
                expression:  expression
              };
            })(result0[0], result0[1], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_choice() {
        var cacheKey = "choice@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_sequence();
        if (result0 !== null) {
          result1 = [];
          pos2 = pos;
          result2 = parse_slash();
          if (result2 !== null) {
            result3 = parse_sequence();
            if (result3 !== null) {
              result2 = [result2, result3];
            } else {
              result2 = null;
              pos = pos2;
            }
          } else {
            result2 = null;
            pos = pos2;
          }
          while (result2 !== null) {
            result1.push(result2);
            pos2 = pos;
            result2 = parse_slash();
            if (result2 !== null) {
              result3 = parse_sequence();
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(head, tail) {
              if (tail.length > 0) {
                var alternatives = [head].concat(map(
                    tail,
                    function(element) { return element[1]; }
                ));
                return {
                  type:         "choice",
                  alternatives: alternatives
                };
              } else {
                return head;
              }
            })(result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_sequence() {
        var cacheKey = "sequence@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = [];
        result1 = parse_labeled();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_labeled();
        }
        if (result0 !== null) {
          result1 = parse_action();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(elements, code) {
              var expression = elements.length !== 1
                ? {
                    type:     "sequence",
                    elements: elements
                  }
                : elements[0];
              for (var i = 1; i < elements.length; i++) {
                var element = elements[i];
                if (element.type == "semantic_and" || element.type == "semantic_not") {
                  element.previousElements = elements.slice(0, i)
                }
              }    
              return {
                type:       "action",
                expression: expression,
                code:       code
              };
            })(result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          result0 = [];
          result1 = parse_labeled();
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_labeled();
          }
          if (result0 !== null) {
            result0 = (function(elements) {
                for (var i = 1; i < elements.length; i++) {
                  var element = elements[i];
                  if (element.type == "semantic_and" || element.type == "semantic_not") {
                    element.previousElements = elements.slice(0, i);
                  }
                }
                return elements.length !== 1
                  ? {
                      type:     "sequence",
                      elements: elements
                    }
                  : elements[0];
              })(result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_labeled() {
        var cacheKey = "labeled@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_identifier();
        if (result0 !== null) {
          result1 = parse_colon();
          if (result1 !== null) {
            result2 = parse_prefixed();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(label, expression) {
              return {
                type:       "labeled",
                label:      label,
                expression: expression
              };
            })(result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_prefixed();
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_prefixed() {
        var cacheKey = "prefixed@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_and();
        if (result0 !== null) {
          result1 = parse_action();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(code) {
              return {
                type: "semantic_and",
                code: code
              };
            })(result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse_and();
          if (result0 !== null) {
            result1 = parse_suffixed();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(expression) {
                return {
                  type:       "simple_and",
                  expression: expression
                };
              })(result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            result0 = parse_not();
            if (result0 !== null) {
              result1 = parse_action();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(code) {
                  return {
                    type: "semantic_not",
                    code: code
                  };
                })(result0[1]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              pos1 = pos;
              result0 = parse_not();
              if (result0 !== null) {
                result1 = parse_suffixed();
                if (result1 !== null) {
                  result0 = [result0, result1];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 !== null) {
                result0 = (function(expression) {
                    return {
                      type:       "simple_not",
                      expression: expression
                    };
                  })(result0[1]);
              }
              if (result0 === null) {
                pos = pos0;
              }
              if (result0 === null) {
                result0 = parse_suffixed();
              }
            }
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_suffixed() {
        var cacheKey = "suffixed@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_primary();
        if (result0 !== null) {
          result1 = parse_question();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(expression) {
              return {
                type:       "optional",
                expression: expression
              };
            })(result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse_primary();
          if (result0 !== null) {
            result1 = parse_star();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(expression) {
                return {
                  type:       "zero_or_more",
                  expression: expression
                };
              })(result0[0]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            result0 = parse_primary();
            if (result0 !== null) {
              result1 = parse_plus();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(expression) {
                  return {
                    type:       "one_or_more",
                    expression: expression
                  };
                })(result0[0]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              result0 = parse_primary();
            }
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_primary() {
        var cacheKey = "primary@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_identifier();
        if (result0 !== null) {
          pos2 = pos;
          reportFailures++;
          pos3 = pos;
          result1 = parse_string();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_equals();
            if (result2 !== null) {
              result1 = [result1, result2];
            } else {
              result1 = null;
              pos = pos3;
            }
          } else {
            result1 = null;
            pos = pos3;
          }
          reportFailures--;
          if (result1 === null) {
            result1 = "";
          } else {
            result1 = null;
            pos = pos2;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(name) {
              return {
                type: "rule_ref",
                name: name
              };
            })(result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_literal();
          if (result0 === null) {
            pos0 = pos;
            result0 = parse_dot();
            if (result0 !== null) {
              result0 = (function() { return { type: "any" }; })();
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              result0 = parse_class();
              if (result0 === null) {
                pos0 = pos;
                pos1 = pos;
                result0 = parse_lparen();
                if (result0 !== null) {
                  result1 = parse_choice();
                  if (result1 !== null) {
                    result2 = parse_rparen();
                    if (result2 !== null) {
                      result0 = [result0, result1, result2];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
                if (result0 !== null) {
                  result0 = (function(expression) { return expression; })(result0[1]);
                }
                if (result0 === null) {
                  pos = pos0;
                }
              }
            }
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_action() {
        var cacheKey = "action@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        result0 = parse_braced();
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(braced) { return braced.substr(1, braced.length - 2); })(result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("action");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_braced() {
        var cacheKey = "braced@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 123) {
          result0 = "{";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"{\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_braced();
          if (result2 === null) {
            result2 = parse_nonBraceCharacter();
          }
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_braced();
            if (result2 === null) {
              result2 = parse_nonBraceCharacter();
            }
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 125) {
              result2 = "}";
              pos += 1;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"}\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(parts) {
              return "{" + parts.join("") + "}";
            })(result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_nonBraceCharacters() {
        var cacheKey = "nonBraceCharacters@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result1 = parse_nonBraceCharacter();
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_nonBraceCharacter();
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(chars) { return chars.join(""); })(result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_nonBraceCharacter() {
        var cacheKey = "nonBraceCharacter@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        if (/^[^{}]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[^{}]");
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_equals() {
        var cacheKey = "equals@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 61) {
          result0 = "=";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"=\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return "="; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_colon() {
        var cacheKey = "colon@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 58) {
          result0 = ":";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\":\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return ":"; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_semicolon() {
        var cacheKey = "semicolon@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 59) {
          result0 = ";";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\";\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return ";"; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_slash() {
        var cacheKey = "slash@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 47) {
          result0 = "/";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"/\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return "/"; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_and() {
        var cacheKey = "and@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 38) {
          result0 = "&";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"&\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return "&"; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_not() {
        var cacheKey = "not@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 33) {
          result0 = "!";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"!\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return "!"; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_question() {
        var cacheKey = "question@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 63) {
          result0 = "?";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"?\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return "?"; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_star() {
        var cacheKey = "star@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 42) {
          result0 = "*";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"*\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return "*"; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_plus() {
        var cacheKey = "plus@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 43) {
          result0 = "+";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"+\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return "+"; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_lparen() {
        var cacheKey = "lparen@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 40) {
          result0 = "(";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"(\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return "("; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_rparen() {
        var cacheKey = "rparen@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 41) {
          result0 = ")";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\")\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return ")"; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_dot() {
        var cacheKey = "dot@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 46) {
          result0 = ".";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\".\"");
          }
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return "."; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_identifier() {
        var cacheKey = "identifier@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        result0 = parse_letter();
        if (result0 === null) {
          if (input.charCodeAt(pos) === 95) {
            result0 = "_";
            pos += 1;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"_\"");
            }
          }
          if (result0 === null) {
            if (input.charCodeAt(pos) === 36) {
              result0 = "$";
              pos += 1;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"$\"");
              }
            }
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_letter();
          if (result2 === null) {
            result2 = parse_digit();
            if (result2 === null) {
              if (input.charCodeAt(pos) === 95) {
                result2 = "_";
                pos += 1;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\"_\"");
                }
              }
              if (result2 === null) {
                if (input.charCodeAt(pos) === 36) {
                  result2 = "$";
                  pos += 1;
                } else {
                  result2 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"$\"");
                  }
                }
              }
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_letter();
            if (result2 === null) {
              result2 = parse_digit();
              if (result2 === null) {
                if (input.charCodeAt(pos) === 95) {
                  result2 = "_";
                  pos += 1;
                } else {
                  result2 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"_\"");
                  }
                }
                if (result2 === null) {
                  if (input.charCodeAt(pos) === 36) {
                    result2 = "$";
                    pos += 1;
                  } else {
                    result2 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"$\"");
                    }
                  }
                }
              }
            }
          }
          if (result1 !== null) {
            result2 = parse___();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(head, tail) {
              return head + tail.join("");
            })(result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("identifier");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_literal() {
        var cacheKey = "literal@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        result0 = parse_doubleQuotedString();
        if (result0 === null) {
          result0 = parse_singleQuotedString();
        }
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 105) {
            result1 = "i";
            pos += 1;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"i\"");
            }
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse___();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(value, flags) {
              return {
                type:       "literal",
                value:      value,
                ignoreCase: flags === "i"
              };
            })(result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("literal");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_string() {
        var cacheKey = "string@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        result0 = parse_doubleQuotedString();
        if (result0 === null) {
          result0 = parse_singleQuotedString();
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(string) { return string; })(result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("string");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_doubleQuotedString() {
        var cacheKey = "doubleQuotedString@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 34) {
          result0 = "\"";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_doubleQuotedCharacter();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_doubleQuotedCharacter();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 34) {
              result2 = "\"";
              pos += 1;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\"\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(chars) { return chars.join(""); })(result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_doubleQuotedCharacter() {
        var cacheKey = "doubleQuotedCharacter@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        result0 = parse_simpleDoubleQuotedCharacter();
        if (result0 === null) {
          result0 = parse_simpleEscapeSequence();
          if (result0 === null) {
            result0 = parse_zeroEscapeSequence();
            if (result0 === null) {
              result0 = parse_hexEscapeSequence();
              if (result0 === null) {
                result0 = parse_unicodeEscapeSequence();
                if (result0 === null) {
                  result0 = parse_eolEscapeSequence();
                }
              }
            }
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_simpleDoubleQuotedCharacter() {
        var cacheKey = "simpleDoubleQuotedCharacter@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        pos2 = pos;
        reportFailures++;
        if (input.charCodeAt(pos) === 34) {
          result0 = "\"";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 92) {
            result0 = "\\";
            pos += 1;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\\\"");
            }
          }
          if (result0 === null) {
            result0 = parse_eolChar();
          }
        }
        reportFailures--;
        if (result0 === null) {
          result0 = "";
        } else {
          result0 = null;
          pos = pos2;
        }
        if (result0 !== null) {
          if (input.length > pos) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("any character");
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(char_) { return char_; })(result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_singleQuotedString() {
        var cacheKey = "singleQuotedString@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 39) {
          result0 = "'";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"'\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_singleQuotedCharacter();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_singleQuotedCharacter();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 39) {
              result2 = "'";
              pos += 1;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"'\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(chars) { return chars.join(""); })(result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_singleQuotedCharacter() {
        var cacheKey = "singleQuotedCharacter@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        result0 = parse_simpleSingleQuotedCharacter();
        if (result0 === null) {
          result0 = parse_simpleEscapeSequence();
          if (result0 === null) {
            result0 = parse_zeroEscapeSequence();
            if (result0 === null) {
              result0 = parse_hexEscapeSequence();
              if (result0 === null) {
                result0 = parse_unicodeEscapeSequence();
                if (result0 === null) {
                  result0 = parse_eolEscapeSequence();
                }
              }
            }
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_simpleSingleQuotedCharacter() {
        var cacheKey = "simpleSingleQuotedCharacter@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        pos2 = pos;
        reportFailures++;
        if (input.charCodeAt(pos) === 39) {
          result0 = "'";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"'\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 92) {
            result0 = "\\";
            pos += 1;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\\\"");
            }
          }
          if (result0 === null) {
            result0 = parse_eolChar();
          }
        }
        reportFailures--;
        if (result0 === null) {
          result0 = "";
        } else {
          result0 = null;
          pos = pos2;
        }
        if (result0 !== null) {
          if (input.length > pos) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("any character");
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(char_) { return char_; })(result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_class() {
        var cacheKey = "class@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 91) {
          result0 = "[";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"[\"");
          }
        }
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 94) {
            result1 = "^";
            pos += 1;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"^\"");
            }
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = [];
            result3 = parse_classCharacterRange();
            if (result3 === null) {
              result3 = parse_classCharacter();
            }
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse_classCharacterRange();
              if (result3 === null) {
                result3 = parse_classCharacter();
              }
            }
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 93) {
                result3 = "]";
                pos += 1;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\"]\"");
                }
              }
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 105) {
                  result4 = "i";
                  pos += 1;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"i\"");
                  }
                }
                result4 = result4 !== null ? result4 : "";
                if (result4 !== null) {
                  result5 = parse___();
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(inverted, parts, flags) {
              var partsConverted = map(parts, function(part) { return part.data; });
              var rawText = "["
                + inverted
                + map(parts, function(part) { return part.rawText; }).join("")
                + "]"
                + flags;
        
              return {
                type:       "class",
                inverted:   inverted === "^",
                ignoreCase: flags === "i",
                parts:      partsConverted,
                // FIXME: Get the raw text from the input directly.
                rawText:    rawText
              };
            })(result0[1], result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("character class");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_classCharacterRange() {
        var cacheKey = "classCharacterRange@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_classCharacter();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 45) {
            result1 = "-";
            pos += 1;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"-\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_classCharacter();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(begin, end) {
              if (begin.data.charCodeAt(0) > end.data.charCodeAt(0)) {
                throw new this.SyntaxError(
                  "Invalid character range: " + begin.rawText + "-" + end.rawText + "."
                );
              }
        
              return {
                data:    [begin.data, end.data],
                // FIXME: Get the raw text from the input directly.
                rawText: begin.rawText + "-" + end.rawText
              };
            })(result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_classCharacter() {
        var cacheKey = "classCharacter@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        var pos0;
        
        pos0 = pos;
        result0 = parse_bracketDelimitedCharacter();
        if (result0 !== null) {
          result0 = (function(char_) {
              return {
                data:    char_,
                // FIXME: Get the raw text from the input directly.
                rawText: quoteForRegexpClass(char_)
              };
            })(result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_bracketDelimitedCharacter() {
        var cacheKey = "bracketDelimitedCharacter@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        result0 = parse_simpleBracketDelimitedCharacter();
        if (result0 === null) {
          result0 = parse_simpleEscapeSequence();
          if (result0 === null) {
            result0 = parse_zeroEscapeSequence();
            if (result0 === null) {
              result0 = parse_hexEscapeSequence();
              if (result0 === null) {
                result0 = parse_unicodeEscapeSequence();
                if (result0 === null) {
                  result0 = parse_eolEscapeSequence();
                }
              }
            }
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_simpleBracketDelimitedCharacter() {
        var cacheKey = "simpleBracketDelimitedCharacter@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        pos2 = pos;
        reportFailures++;
        if (input.charCodeAt(pos) === 93) {
          result0 = "]";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"]\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 92) {
            result0 = "\\";
            pos += 1;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\\\"");
            }
          }
          if (result0 === null) {
            result0 = parse_eolChar();
          }
        }
        reportFailures--;
        if (result0 === null) {
          result0 = "";
        } else {
          result0 = null;
          pos = pos2;
        }
        if (result0 !== null) {
          if (input.length > pos) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("any character");
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(char_) { return char_; })(result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_simpleEscapeSequence() {
        var cacheKey = "simpleEscapeSequence@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 92) {
          result0 = "\\";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\\"");
          }
        }
        if (result0 !== null) {
          pos2 = pos;
          reportFailures++;
          result1 = parse_digit();
          if (result1 === null) {
            if (input.charCodeAt(pos) === 120) {
              result1 = "x";
              pos += 1;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"x\"");
              }
            }
            if (result1 === null) {
              if (input.charCodeAt(pos) === 117) {
                result1 = "u";
                pos += 1;
              } else {
                result1 = null;
                if (reportFailures === 0) {
                  matchFailed("\"u\"");
                }
              }
              if (result1 === null) {
                result1 = parse_eolChar();
              }
            }
          }
          reportFailures--;
          if (result1 === null) {
            result1 = "";
          } else {
            result1 = null;
            pos = pos2;
          }
          if (result1 !== null) {
            if (input.length > pos) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("any character");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(char_) {
              return char_
                .replace("b", "\b")
                .replace("f", "\f")
                .replace("n", "\n")
                .replace("r", "\r")
                .replace("t", "\t")
                .replace("v", "\x0B"); // IE does not recognize "\v".
            })(result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_zeroEscapeSequence() {
        var cacheKey = "zeroEscapeSequence@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 2) === "\\0") {
          result0 = "\\0";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\0\"");
          }
        }
        if (result0 !== null) {
          pos2 = pos;
          reportFailures++;
          result1 = parse_digit();
          reportFailures--;
          if (result1 === null) {
            result1 = "";
          } else {
            result1 = null;
            pos = pos2;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function() { return "\x00"; })();
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_hexEscapeSequence() {
        var cacheKey = "hexEscapeSequence@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 2) === "\\x") {
          result0 = "\\x";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\x\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_hexDigit();
          if (result1 !== null) {
            result2 = parse_hexDigit();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(h1, h2) {
              return String.fromCharCode(parseInt(h1 + h2, 16));
            })(result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_unicodeEscapeSequence() {
        var cacheKey = "unicodeEscapeSequence@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 2) === "\\u") {
          result0 = "\\u";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\u\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_hexDigit();
          if (result1 !== null) {
            result2 = parse_hexDigit();
            if (result2 !== null) {
              result3 = parse_hexDigit();
              if (result3 !== null) {
                result4 = parse_hexDigit();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(h1, h2, h3, h4) {
              return String.fromCharCode(parseInt(h1 + h2 + h3 + h4, 16));
            })(result0[1], result0[2], result0[3], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_eolEscapeSequence() {
        var cacheKey = "eolEscapeSequence@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 92) {
          result0 = "\\";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_eol();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(eol) { return eol; })(result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_digit() {
        var cacheKey = "digit@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        if (/^[0-9]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9]");
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_hexDigit() {
        var cacheKey = "hexDigit@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        if (/^[0-9a-fA-F]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9a-fA-F]");
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_letter() {
        var cacheKey = "letter@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        result0 = parse_lowerCaseLetter();
        if (result0 === null) {
          result0 = parse_upperCaseLetter();
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_lowerCaseLetter() {
        var cacheKey = "lowerCaseLetter@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        if (/^[a-z]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[a-z]");
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_upperCaseLetter() {
        var cacheKey = "upperCaseLetter@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        if (/^[A-Z]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[A-Z]");
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse___() {
        var cacheKey = "__@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1;
        
        result0 = [];
        result1 = parse_whitespace();
        if (result1 === null) {
          result1 = parse_eol();
          if (result1 === null) {
            result1 = parse_comment();
          }
        }
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_whitespace();
          if (result1 === null) {
            result1 = parse_eol();
            if (result1 === null) {
              result1 = parse_comment();
            }
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_comment() {
        var cacheKey = "comment@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        reportFailures++;
        result0 = parse_singleLineComment();
        if (result0 === null) {
          result0 = parse_multiLineComment();
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("comment");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_singleLineComment() {
        var cacheKey = "singleLineComment@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        if (input.substr(pos, 2) === "//") {
          result0 = "//";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"//\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          pos1 = pos;
          pos2 = pos;
          reportFailures++;
          result2 = parse_eolChar();
          reportFailures--;
          if (result2 === null) {
            result2 = "";
          } else {
            result2 = null;
            pos = pos2;
          }
          if (result2 !== null) {
            if (input.length > pos) {
              result3 = input.charAt(pos);
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("any character");
              }
            }
            if (result3 !== null) {
              result2 = [result2, result3];
            } else {
              result2 = null;
              pos = pos1;
            }
          } else {
            result2 = null;
            pos = pos1;
          }
          while (result2 !== null) {
            result1.push(result2);
            pos1 = pos;
            pos2 = pos;
            reportFailures++;
            result2 = parse_eolChar();
            reportFailures--;
            if (result2 === null) {
              result2 = "";
            } else {
              result2 = null;
              pos = pos2;
            }
            if (result2 !== null) {
              if (input.length > pos) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("any character");
                }
              }
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos1;
              }
            } else {
              result2 = null;
              pos = pos1;
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_multiLineComment() {
        var cacheKey = "multiLineComment@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        if (input.substr(pos, 2) === "/*") {
          result0 = "/*";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"/*\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          pos1 = pos;
          pos2 = pos;
          reportFailures++;
          if (input.substr(pos, 2) === "*/") {
            result2 = "*/";
            pos += 2;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("\"*/\"");
            }
          }
          reportFailures--;
          if (result2 === null) {
            result2 = "";
          } else {
            result2 = null;
            pos = pos2;
          }
          if (result2 !== null) {
            if (input.length > pos) {
              result3 = input.charAt(pos);
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("any character");
              }
            }
            if (result3 !== null) {
              result2 = [result2, result3];
            } else {
              result2 = null;
              pos = pos1;
            }
          } else {
            result2 = null;
            pos = pos1;
          }
          while (result2 !== null) {
            result1.push(result2);
            pos1 = pos;
            pos2 = pos;
            reportFailures++;
            if (input.substr(pos, 2) === "*/") {
              result2 = "*/";
              pos += 2;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"*/\"");
              }
            }
            reportFailures--;
            if (result2 === null) {
              result2 = "";
            } else {
              result2 = null;
              pos = pos2;
            }
            if (result2 !== null) {
              if (input.length > pos) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("any character");
                }
              }
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos1;
              }
            } else {
              result2 = null;
              pos = pos1;
            }
          }
          if (result1 !== null) {
            if (input.substr(pos, 2) === "*/") {
              result2 = "*/";
              pos += 2;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"*/\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_eol() {
        var cacheKey = "eol@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        reportFailures++;
        if (input.charCodeAt(pos) === 10) {
          result0 = "\n";
          pos += 1;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\n\"");
          }
        }
        if (result0 === null) {
          if (input.substr(pos, 2) === "\r\n") {
            result0 = "\r\n";
            pos += 2;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\r\\n\"");
            }
          }
          if (result0 === null) {
            if (input.charCodeAt(pos) === 13) {
              result0 = "\r";
              pos += 1;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\r\"");
              }
            }
            if (result0 === null) {
              if (input.charCodeAt(pos) === 8232) {
                result0 = "\u2028";
                pos += 1;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\u2028\"");
                }
              }
              if (result0 === null) {
                if (input.charCodeAt(pos) === 8233) {
                  result0 = "\u2029";
                  pos += 1;
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"\\u2029\"");
                  }
                }
              }
            }
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("end of line");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_eolChar() {
        var cacheKey = "eolChar@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        if (/^[\n\r\u2028\u2029]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[\\n\\r\\u2028\\u2029]");
          }
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_whitespace() {
        var cacheKey = "whitespace@" + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var result0;
        
        reportFailures++;
        if (/^[ \t\x0B\f\xA0\uFEFF\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[ \\t\\x0B\\f\\xA0\\uFEFF\\u1680\\u180E\\u2000-\\u200A\\u202F\\u205F\\u3000]");
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("whitespace");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function buildErrorMessage() {
        function buildExpected(failuresExpected) {
          failuresExpected.sort();
          
          var lastFailure = null;
          var failuresExpectedUnique = [];
          for (var i = 0; i < failuresExpected.length; i++) {
            if (failuresExpected[i] !== lastFailure) {
              failuresExpectedUnique.push(failuresExpected[i]);
              lastFailure = failuresExpected[i];
            }
          }
          
          switch (failuresExpectedUnique.length) {
            case 0:
              return "end of input";
            case 1:
              return failuresExpectedUnique[0];
            default:
              return failuresExpectedUnique.slice(0, failuresExpectedUnique.length - 1).join(", ")
                + " or "
                + failuresExpectedUnique[failuresExpectedUnique.length - 1];
          }
        }
        
        var expected = buildExpected(rightmostFailuresExpected);
        var actualPos = Math.max(pos, rightmostFailuresPos);
        var actual = actualPos < input.length
          ? quote(input.charAt(actualPos))
          : "end of input";
        
        return "Expected " + expected + " but " + actual + " found.";
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var errorPosition = computeErrorPosition();
        throw new this.SyntaxError(
          buildErrorMessage(),
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(message, line, column) {
    this.name = "SyntaxError";
    this.message = message;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
PEG.compiler = {
  /*
   * Names of passes that will get run during the compilation (in the specified
   * order).
   */
  appliedPassNames: [
    "reportMissingRules",
    "reportLeftRecursion",
    "removeProxyRules",
    "computeStackDepths"
  ],

  /*
   * Generates a parser from a specified grammar AST. Throws |PEG.GrammarError|
   * if the AST contains a semantic error. Note that not all errors are detected
   * during the generation and some may protrude to the generated parser and
   * cause its malfunction.
   */
  compile: function(ast) {
    var that = this;

    each(this.appliedPassNames, function(passName) {
      that.passes[passName](ast);
    });

    var source = this.emitter(ast);
    var result = eval(source);
    result._source = source;

    return result;
  }
};

/*
 * Compiler passes.
 *
 * Each pass is a function that is passed the AST. It can perform checks on it
 * or modify it as needed. If the pass encounters a semantic error, it throws
 * |PEG.GrammarError|.
 */
PEG.compiler.passes = {
  /* Checks that all referenced rules exist. */
  reportMissingRules: function(ast) {
    function nop() {}

    function checkExpression(node) { check(node.expression); }

    function checkSubnodes(propertyName) {
      return function(node) { each(node[propertyName], check); };
    }

    var check = buildNodeVisitor({
      grammar:
        function(node) {
          for (var name in node.rules) {
            check(node.rules[name]);
          }
        },

      rule:         checkExpression,
      choice:       checkSubnodes("alternatives"),
      sequence:     checkSubnodes("elements"),
      labeled:      checkExpression,
      simple_and:   checkExpression,
      simple_not:   checkExpression,
      semantic_and: nop,
      semantic_not: nop,
      optional:     checkExpression,
      zero_or_more: checkExpression,
      one_or_more:  checkExpression,
      action:       checkExpression,

      rule_ref:
        function(node) {
          if (ast.rules[node.name] === undefined) {
            throw new PEG.GrammarError(
              "Referenced rule \"" + node.name + "\" does not exist."
            );
          }
        },

      literal:      nop,
      any:          nop,
      "class":      nop
    });

    check(ast);
  },

  /* Checks that no left recursion is present. */
  reportLeftRecursion: function(ast) {
    function nop() {}

    function checkExpression(node, appliedRules) {
      check(node.expression, appliedRules);
    }

    var check = buildNodeVisitor({
      grammar:
        function(node, appliedRules) {
          for (var name in node.rules) {
            check(node.rules[name], appliedRules);
          }
        },

      rule:
        function(node, appliedRules) {
          check(node.expression, appliedRules.concat(node.name));
        },

      choice:
        function(node, appliedRules) {
          each(node.alternatives, function(alternative) {
            check(alternative, appliedRules);
          });
        },

      sequence:
        function(node, appliedRules) {
          if (node.elements.length > 0) {
            check(node.elements[0], appliedRules);
          }
        },

      labeled:      checkExpression,
      simple_and:   checkExpression,
      simple_not:   checkExpression,
      semantic_and: nop,
      semantic_not: nop,
      optional:     checkExpression,
      zero_or_more: checkExpression,
      one_or_more:  checkExpression,
      action:       checkExpression,

      rule_ref:
        function(node, appliedRules) {
          if (contains(appliedRules, node.name)) {
            throw new PEG.GrammarError(
              "Left recursion detected for rule \"" + node.name + "\"."
            );
          }
          check(ast.rules[node.name], appliedRules);
        },

      literal:      nop,
      any:          nop,
      "class":      nop
    });

    check(ast, []);
  },

  /*
   * Removes proxy rules -- that is, rules that only delegate to other rule.
   */
  removeProxyRules: function(ast) {
    function isProxyRule(node) {
      return node.type === "rule" && node.expression.type === "rule_ref";
    }

    function replaceRuleRefs(ast, from, to) {
      function nop() {}

      function replaceInExpression(node, from, to) {
        replace(node.expression, from, to);
      }

      function replaceInSubnodes(propertyName) {
        return function(node, from, to) {
          each(node[propertyName], function(subnode) {
            replace(subnode, from, to);
          });
        };
      }

      var replace = buildNodeVisitor({
        grammar:
          function(node, from, to) {
            for (var name in node.rules) {
              replace(node.rules[name], from, to);
            }
          },

        rule:         replaceInExpression,
        choice:       replaceInSubnodes("alternatives"),
        sequence:     replaceInSubnodes("elements"),
        labeled:      replaceInExpression,
        simple_and:   replaceInExpression,
        simple_not:   replaceInExpression,
        semantic_and: nop,
        semantic_not: nop,
        optional:     replaceInExpression,
        zero_or_more: replaceInExpression,
        one_or_more:  replaceInExpression,
        action:       replaceInExpression,

        rule_ref:
          function(node, from, to) {
            if (node.name === from) {
              node.name = to;
            }
          },

        literal:      nop,
        any:          nop,
        "class":      nop
      });

      replace(ast, from, to);
    }

    for (var name in ast.rules) {
      if (isProxyRule(ast.rules[name])) {
        replaceRuleRefs(ast, ast.rules[name].name, ast.rules[name].expression.name);
        if (name === ast.startRule) {
          ast.startRule = ast.rules[name].expression.name;
        }
        delete ast.rules[name];
      }
    }
  },

  /*
   * Adds |resultStackDepth| and |posStackDepth| properties to each AST node.
   * These properties specify how many positions on the result or position stack
   * code generated by the emitter for the node will use. This information is
   * used to declare varibles holding the stack data in the generated code.
   */
  computeStackDepths: function(ast) {
    function computeZeroes(node) {
      node.resultStackDepth = 0;
      node.posStackDepth = 0;
    }

    function computeFromExpression(resultStackDelta, posStackDelta) {
      return function(node) {
        compute(node.expression);
        node.resultStackDepth = node.expression.resultStackDepth + resultStackDelta;
        node.posStackDepth    = node.expression.posStackDepth    + posStackDelta;
      };
    }

    var compute = buildNodeVisitor({
      grammar:
        function(node) {
          for (var name in node.rules) {
            compute(node.rules[name]);
          }
        },

      rule:         computeFromExpression(1, 0),

      choice:
        function(node) {
          each(node.alternatives, compute);
          node.resultStackDepth = Math.max.apply(
            null,
            map(node.alternatives, function(e) { return e.resultStackDepth; })
          );
          node.posStackDepth = Math.max.apply(
            null,
            map(node.alternatives, function(e) { return e.posStackDepth; })
          );
        },

      sequence:
        function(node) {
          each(node.elements, compute);
          node.resultStackDepth = node.elements.length > 0
            ? Math.max.apply(
                null,
                map(node.elements, function(e, i) { return i + e.resultStackDepth; })
              )
            : 0;
          node.posStackDepth = node.elements.length > 0
            ? 1 + Math.max.apply(
                null,
                map(node.elements, function(e) { return e.posStackDepth; })
              )
            : 1;
        },

      labeled:      computeFromExpression(0, 0),
      simple_and:   computeFromExpression(0, 1),
      simple_not:   computeFromExpression(0, 1),
      semantic_and: computeZeroes,
      semantic_not: computeZeroes,
      optional:     computeFromExpression(0, 0),
      zero_or_more: computeFromExpression(1, 0),
      one_or_more:  computeFromExpression(1, 0),
      action:       computeFromExpression(0, 1),
      rule_ref:     computeZeroes,
      literal:      computeZeroes,
      any:          computeZeroes,
      "class":      computeZeroes
    });

    compute(ast);
  }
};
/* Emits the generated code for the AST. */
PEG.compiler.emitter = function(ast) {
  var Codie = (function(undefined) {
    function stringEscape(s) {
      function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

      /*
       * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
       * string literal except for the closing quote character, backslash,
       * carriage return, line separator, paragraph separator, and line feed.
       * Any character may appear in the form of an escape sequence.
       *
       * For portability, we also escape escape all control and non-ASCII
       * characters. Note that "\0" and "\v" escape sequences are not used
       * because JSHint does not like the first and IE the second.
       */
      return s
       .replace(/\\/g,   '\\\\') // backslash
       .replace(/"/g,    '\\"')  // closing double quote
       .replace(/\x08/g, '\\b')  // backspace
       .replace(/\t/g,   '\\t')  // horizontal tab
       .replace(/\n/g,   '\\n')  // line feed
       .replace(/\f/g,   '\\f')  // form feed
       .replace(/\r/g,   '\\r')  // carriage return
       .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
       .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
       .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
       .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
    }

    function push(s) { return '__p.push(' + s + ');'; }

    function pushRaw(template, length, state) {
      function unindent(code, level, unindentFirst) {
        return code.replace(
          new RegExp('^.{' + level +'}', "gm"),
          function(str, offset) {
            if (offset === 0) {
              return unindentFirst ? '' : str;
            } else {
              return "";
            }
          }
        );
      }

      var escaped = stringEscape(unindent(
            template.substring(0, length),
            state.indentLevel(),
            state.atBOL
          ));

      return escaped.length > 0 ? push('"' + escaped + '"') : '';
    }

    var Codie = {
      /*
       * Specifies by how many characters do #if/#else and #for unindent their
       * content in the generated code.
       */
      indentStep: 2,

      /* Description of #-commands. Extend to define your own commands. */
      commands: {
        "if":   {
          params:  /^(.*)$/,
          compile: function(state, prefix, params) {
            return ['if(' + params[0] + '){', []];
          },
          stackOp: "push"
        },
        "else": {
          params:  /^$/,
          compile: function(state) {
            var stack = state.commandStack,
                insideElse = stack[stack.length - 1] === "else",
                insideIf   = stack[stack.length - 1] === "if";

            if (insideElse) { throw new Error("Multiple #elses."); }
            if (!insideIf)  { throw new Error("Using #else outside of #if."); }

            return ['}else{', []];
          },
          stackOp: "replace"
        },
        "for":  {
          params:  /^([a-zA-Z_][a-zA-Z0-9_]*)[ \t]+in[ \t]+(.*)$/,
          init:    function(state) {
            state.forCurrLevel = 0;  // current level of #for loop nesting
            state.forMaxLevel  = 0;  // maximum level of #for loop nesting
          },
          compile: function(state, prefix, params) {
            var c = '__c' + state.forCurrLevel, // __c for "collection"
                l = '__l' + state.forCurrLevel, // __l for "length"
                i = '__i' + state.forCurrLevel; // __i for "index"

            state.forCurrLevel++;
            if (state.forMaxLevel < state.forCurrLevel) {
              state.forMaxLevel = state.forCurrLevel;
            }

            return [
              c + '=' + params[1] + ';'
                +  l + '=' + c + '.length;'
                + 'for(' + i + '=0;' + i + '<' + l + ';' + i + '++){'
                +  params[0] + '=' + c + '[' + i + '];',
              [params[0], c, l, i]
            ];
          },
          exit:    function(state) { state.forCurrLevel--; },
          stackOp: "push"
        },
        "end":  {
          params:  /^$/,
          compile: function(state) {
            var stack = state.commandStack, exit;

            if (stack.length === 0) { throw new Error("Too many #ends."); }

            exit = Codie.commands[stack[stack.length - 1]].exit;
            if (exit) { exit(state); }

            return ['}', []];
          },
          stackOp: "pop"
        },
        "block": {
          params: /^(.*)$/,
          compile: function(state, prefix, params) {
            return [
              push('(' + params[0] + ').toString().replace(/^/gm, "'
                + stringEscape(prefix.substring(state.indentLevel()))
                + '") + "\\n"'),
              []
            ];
          },
          stackOp: "nop"
        }
      },

      /*
       * Compiles a template into a function. When called, this function will
       * execute the template in the context of an object passed in a parameter and
       * return the result.
       */
      template: function(template) {
        var stackOps = {
          push:    function(stack, name) { stack.push(name); },
          replace: function(stack, name) { stack[stack.length - 1] = name; },
          pop:     function(stack)       { stack.pop(); },
          nop:     function()            { }
        };

        function compileExpr(state, expr) {
          state.atBOL = false;
          return [push(expr), []];
        }

        function compileCommand(state, prefix, name, params) {
          var command, match, result;

          command = Codie.commands[name];
          if (!command) { throw new Error("Unknown command: #" + name + "."); }

          match = command.params.exec(params);
          if (match === null) {
            throw new Error(
              "Invalid params for command #" + name + ": " + params + "."
            );
          }

          result = command.compile(state, prefix, match.slice(1));
          stackOps[command.stackOp](state.commandStack, name);
          state.atBOL = true;
          return result;
        }

        var state = {               // compilation state
              commandStack: [],     //   stack of commands as they were nested
              atBOL:        true,   //   is the next character to process at BOL?
              indentLevel:  function() {
                return Codie.indentStep * this.commandStack.length;
              }
            },
            code = '',              // generated template function code
            vars = ['__p=[]'],      // variables used by generated code
            name, match, result, i;

        /* Initialize state. */
        for (name in Codie.commands) {
          if (Codie.commands[name].init) { Codie.commands[name].init(state); }
        }

        /* Compile the template. */
        while ((match = /^([ \t]*)#([a-zA-Z_][a-zA-Z0-9_]*)(?:[ \t]+([^ \t\n][^\n]*))?[ \t]*(?:\n|$)|#\{([^}]*)\}/m.exec(template)) !== null) {
          code += pushRaw(template, match.index, state);
          result = match[2] !== undefined && match[2] !== ""
            ? compileCommand(state, match[1], match[2], match[3] || "") // #-command
            : compileExpr(state, match[4]);                             // #{...}
          code += result[0];
          vars = vars.concat(result[1]);
          template = template.substring(match.index + match[0].length);
        }
        code += pushRaw(template, template.length, state);

        /* Check the final state. */
        if (state.commandStack.length > 0) { throw new Error("Missing #end."); }

        /* Sanitize the list of variables used by commands. */
        vars.sort();
        for (i = 0; i < vars.length; i++) {
          if (vars[i] === vars[i - 1]) { vars.splice(i--, 1); }
        }

        /* Create the resulting function. */
        return new Function("__v", [
          '__v=__v||{};',
          'var ' + vars.join(',') + ';',
          'with(__v){',
          code,
          'return __p.join("").replace(/^\\n+|\\n+$/g,"");};'
        ].join(''));
      }
    };

    return Codie;
  })();

  var templates = (function() {
    var name,
        templates = {},
        sources = {
          grammar: [
            '(function(){',
            '  /* Generated by PEG.js 0.6.2 (http://pegjs.majda.cz/). */',
            '  ',
            '  var result = {',
            '    /*',
            '     * Parses the input with a generated parser. If the parsing is successfull,',
            '     * returns a value explicitly or implicitly specified by the grammar from',
            '     * which the parser was generated (see |PEG.buildParser|). If the parsing is',
            '     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.',
            '     */',
            '    parse: function(input, startRule) {',
            '      var parseFunctions = {',
            '        #block parseFunctionTableItems.join(",\\n")',
            '      };',
            '      ',
            '      if (startRule !== undefined) {',
            '        if (parseFunctions[startRule] === undefined) {',
            '          throw new Error("Invalid rule name: " + quote(startRule) + ".");',
            '        }',
            '      } else {',
            '        startRule = #{string(startRule)};',
            '      }',
            '      ',
            '      var pos = 0;',
            '      var reportFailures = 0;', // 0 = report, anything > 0 = do not report
            '      var rightmostFailuresPos = 0;',
            '      var rightmostFailuresExpected = [];',
            '      var cache = {};',
            '      var _chunk = {"pos":-1,"end":-1,"match":""};',            
            '      ',
            /* This needs to be in sync with |padLeft| in utils.js. */
            '      function padLeft(input, padding, length) {',
            '        var result = input;',
            '        ',
            '        var padLength = length - input.length;',
            '        for (var i = 0; i < padLength; i++) {',
            '          result = padding + result;',
            '        }',
            '        ',
            '        return result;',
            '      }',
            '      ',
            /* This needs to be in sync with |escape| in utils.js. */
            '      function escape(ch) {',
            '        var charCode = ch.charCodeAt(0);',
            '        var escapeChar;',
            '        var length;',
            '        ',
            '        if (charCode <= 0xFF) {',
            '          escapeChar = \'x\';',
            '          length = 2;',
            '        } else {',
            '          escapeChar = \'u\';',
            '          length = 4;',
            '        }',
            '        ',
            '        return \'\\\\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), \'0\', length);',
            '      }',
            '      ',
            /* This needs to be in sync with |quote| in utils.js. */
            '      function quote(s) {',
            '        /*',
            '         * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a',
            '         * string literal except for the closing quote character, backslash,',
            '         * carriage return, line separator, paragraph separator, and line feed.',
            '         * Any character may appear in the form of an escape sequence.',
            '         *',
            '         * For portability, we also escape escape all control and non-ASCII',
            '         * characters. Note that "\\0" and "\\v" escape sequences are not used',
            '         * because JSHint does not like the first and IE the second.',
            '         */',
            '        return \'"\' + s',
            '          .replace(/\\\\/g, \'\\\\\\\\\')  // backslash',
            '          .replace(/"/g, \'\\\\"\')    // closing quote character',
            '          .replace(/\\x08/g, \'\\\\b\') // backspace',
            '          .replace(/\\t/g, \'\\\\t\')   // horizontal tab',
            '          .replace(/\\n/g, \'\\\\n\')   // line feed',
            '          .replace(/\\f/g, \'\\\\f\')   // form feed',
            '          .replace(/\\r/g, \'\\\\r\')   // carriage return',
            '          .replace(/[\\x00-\\x07\\x0B\\x0E-\\x1F\\x80-\\uFFFF]/g, escape)',
            '          + \'"\';',
            '      }',
            '      ',
            '      function matchFailed(failure) {',
            '        if (pos < rightmostFailuresPos) {',
            '          return;',
            '        }',
            '        ',
            '        if (pos > rightmostFailuresPos) {',
            '          rightmostFailuresPos = pos;',
            '          rightmostFailuresExpected = [];',
            '        }',
            '        ',
            '        rightmostFailuresExpected.push(failure);',
            '      }',
            '      ',
            '      #for definition in parseFunctionDefinitions',
            '        #block definition',
            '        ',
            '      #end',
            '      function buildErrorMessage() {',
            '        function buildExpected(failuresExpected) {',
            '          failuresExpected.sort();',
            '          ',
            '          var lastFailure = null;',
            '          var failuresExpectedUnique = [];',
            '          for (var i = 0; i < failuresExpected.length; i++) {',
            '            if (failuresExpected[i] !== lastFailure) {',
            '              failuresExpectedUnique.push(failuresExpected[i]);',
            '              lastFailure = failuresExpected[i];',
            '            }',
            '          }',
            '          ',
            '          switch (failuresExpectedUnique.length) {',
            '            case 0:',
            '              return "end of input";',
            '            case 1:',
            '              return failuresExpectedUnique[0];',
            '            default:',
            '              return failuresExpectedUnique.slice(0, failuresExpectedUnique.length - 1).join(", ")',
            '                + " or "',
            '                + failuresExpectedUnique[failuresExpectedUnique.length - 1];',
            '          }',
            '        }',
            '        ',
            '        var expected = buildExpected(rightmostFailuresExpected);',
            '        var actualPos = Math.max(pos, rightmostFailuresPos);',
            '        var actual = actualPos < input.length',
            '          ? quote(input.charAt(actualPos))',
            '          : "end of input";',
            '        ',
            '        return "Expected " + expected + " but " + actual + " found.";',
            '      }',
            '      ',
            '      function computeErrorPosition() {',
            '        /*',
            '         * The first idea was to use |String.split| to break the input up to the',
            '         * error position along newlines and derive the line and column from',
            '         * there. However IE\'s |split| implementation is so broken that it was',
            '         * enough to prevent it.',
            '         */',
            '        ',
            '        var line = 1;',
            '        var column = 1;',
            '        var seenCR = false;',
            '        ',
            '        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {',
            '          var ch = input.charAt(i);',
            '          if (ch === "\\n") {',
            '            if (!seenCR) { line++; }',
            '            column = 1;',
            '            seenCR = false;',
            '          } else if (ch === "\\r" || ch === "\\u2028" || ch === "\\u2029") {',
            '            line++;',
            '            column = 1;',
            '            seenCR = true;',
            '          } else {',
            '            column++;',
            '            seenCR = false;',
            '          }',
            '        }',
            '        ',
            '        return { line: line, column: column };',
            '      }',
            '      ',
            '      #if initializerCode !== ""',
            '        #block initializerCode',
            '      #end',
            '      ',
            '      var result = parseFunctions[startRule]();',
            '      ',
            '      /*',
            '       * The parser is now in one of the following three states:',
            '       *',
            '       * 1. The parser successfully parsed the whole input.',
            '       *',
            '       *    - |result !== null|',
            '       *    - |pos === input.length|',
            '       *    - |rightmostFailuresExpected| may or may not contain something',
            '       *',
            '       * 2. The parser successfully parsed only a part of the input.',
            '       *',
            '       *    - |result !== null|',
            '       *    - |pos < input.length|',
            '       *    - |rightmostFailuresExpected| may or may not contain something',
            '       *',
            '       * 3. The parser did not successfully parse any part of the input.',
            '       *',
            '       *   - |result === null|',
            '       *   - |pos === 0|',
            '       *   - |rightmostFailuresExpected| contains at least one failure',
            '       *',
            '       * All code following this comment (including called functions) must',
            '       * handle these states.',
            '       */',
            '      if (result === null || pos !== input.length) {',
            '        var errorPosition = computeErrorPosition();',
            '        throw new this.SyntaxError(',
            '          buildErrorMessage(),',
            '          errorPosition.line,',
            '          errorPosition.column',
            '        );',
            '      }',
            '      ',
            '      return result;',
            '    },',
            '    ',
            '    /* Returns the parser source code. */',
            '    toSource: function() { return this._source; }',
            '  };',
            '  ',
            '  /* Thrown when a parser encounters a syntax error. */',
            '  ',
            '  result.SyntaxError = function(message, line, column) {',
            '    this.name = "SyntaxError";',
            '    this.message = message;',
            '    this.line = line;',
            '    this.column = column;',
            '  };',
            '  ',
            '  result.SyntaxError.prototype = Error.prototype;',
            '  ',
            '  return result;',
            '})()'
          ],
          rule: [
            'function parse_#{node.name}() {',
            '  var cacheKey = "#{node.name}@" + pos;',
            '  var cachedResult = cache[cacheKey];',
            '  if (cachedResult) {',
            '    pos = cachedResult.nextPos;',
            '    return cachedResult.result;',
            '  }',
            '  ',
            '  #if resultVars.length > 0',
            '    var #{resultVars.join(", ")};',
            '  #end',
            '  #if posVars.length > 0',
            '    var #{posVars.join(", ")};',
            '  #end',
            '  ',
            '  #if node.displayName !== null',
            '    reportFailures++;',
            '  #end',
            '  #block code',
            '  #if node.displayName !== null',
            '    reportFailures--;',
            '    if (reportFailures === 0 && #{resultVar} === null) {',
            '      matchFailed(#{string(node.displayName)});',
            '    }',
            '  #end',
            '  ',
            '  cache[cacheKey] = {',
            '    nextPos: pos,',
            '    result:  #{resultVar}',
            '  };',
            '  return #{resultVar};',
            '}'
          ],
          choice: [
            '#block currentAlternativeCode',
            '#block nextAlternativesCode'
          ],
          "choice.next": [
            'if (#{resultVar} === null) {',
            '  #block code',
            '}'
          ],
          sequence: [
            '#{posVar} = pos;',
            '#block code'
          ],
          "sequence.iteration": [
            '#block elementCode',
            'if (#{elementResultVar} !== null) {',
            '  #block code',
            '} else {',
            '  #{resultVar} = null;',
            '  pos = #{posVar};',
            '}'
          ],
          "sequence.inner": [
            '#{resultVar} = [#{elementResultVars.join(", ")}];'
          ],
          simple_and: [
            '#{posVar} = pos;',
            'reportFailures++;',
            '#block expressionCode',
            'reportFailures--;',
            'if (#{resultVar} !== null) {',
            '  #{resultVar} = "";',
            '  pos = #{posVar};',
            '} else {',
            '  #{resultVar} = null;',
            '}'
          ],
          simple_not: [
            '#{posVar} = pos;',
            'reportFailures++;',
            '#block expressionCode',
            'reportFailures--;',
            'if (#{resultVar} === null) {',
            '  #{resultVar} = "";',
            '} else {',
            '  #{resultVar} = null;',
            '  pos = #{posVar};',
            '}'
          ],
          semantic_and: [
            '#{resultVar} = (function(#{formalParams.join(", ")}) {#{node.code}})(#{actualParams.join(", ")}) ? "" : null;'
          ],
          semantic_not: [
            '#{resultVar} = (function(#{formalParams.join(", ")}) {#{node.code}})(#{actualParams.join(", ")}) ? null : "";'
          ],
          optional: [
            '#block expressionCode',
            '#{resultVar} = #{resultVar} !== null ? #{resultVar} : "";'
          ],
          zero_or_more: [
            '#{resultVar} = [];',
            '#block expressionCode',
            'while (#{expressionResultVar} !== null) {',
            '  #{resultVar}.push(#{expressionResultVar});',
            '  #block expressionCode',
            '}'
          ],
          one_or_more: [
            '#block expressionCode',
            'if (#{expressionResultVar} !== null) {',
            '  #{resultVar} = [];',
            '  while (#{expressionResultVar} !== null) {',
            '    #{resultVar}.push(#{expressionResultVar});',
            '    #block expressionCode',
            '  }',
            '} else {',
            '  #{resultVar} = null;',
            '}'
          ],
          action: [
            '#{posVar} = pos;',
            '#block expressionCode',
            '_chunk.pos = #{posVar};',
            '_chunk.end = pos;',
            '_chunk.match = input.substring(#{posVar},pos);',            
            'if (#{resultVar} !== null) {',
            '  #{resultVar} = (function(#{formalParams.join(", ")}) {#{node.code}})(#{actualParams.join(", ")});',
            '}',
            'if (#{resultVar} === null) {',
            '  pos = #{posVar};',
            '}'            
          ],
          rule_ref: [
            '#{resultVar} = parse_#{node.name}();'
          ],
          literal: [
            '#if node.value.length === 0',
            '  #{resultVar} = "";',
            '#else',
            '  #if !node.ignoreCase',
            '    #if node.value.length === 1',
            '      if (input.charCodeAt(pos) === #{node.value.charCodeAt(0)}) {',
            '    #else',
            '      if (input.substr(pos, #{node.value.length}) === #{string(node.value)}) {',
            '    #end',
            '  #else',
            /*
             * One-char literals are not optimized when case-insensitive
             * matching is enabled. This is because there is no simple way to
             * lowercase a character code that works for character outside ASCII
             * letters. Moreover, |toLowerCase| can change string length,
             * meaning the result of lowercasing a character can be more
             * characters.
             */
            '    if (input.substr(pos, #{node.value.length}).toLowerCase() === #{string(node.value.toLowerCase())}) {',
            '  #end',
            '    #if !node.ignoreCase',
            '      #{resultVar} = #{string(node.value)};',
            '    #else',
            '      #{resultVar} = input.substr(pos, #{node.value.length});',
            '    #end',
            '    pos += #{node.value.length};',
            '  } else {',
            '    #{resultVar} = null;',
            '    if (reportFailures === 0) {',
            '      matchFailed(#{string(string(node.value))});',
            '    }',
            '  }',
            '#end'
          ],
          any: [
            'if (input.length > pos) {',
            '  #{resultVar} = input.charAt(pos);',
            '  pos++;',
            '} else {',
            '  #{resultVar} = null;',
            '  if (reportFailures === 0) {',
            '    matchFailed("any character");',
            '  }',
            '}'
          ],
          "class": [
            'if (#{regexp}.test(input.charAt(pos))) {',
            '  #{resultVar} = input.charAt(pos);',
            '  pos++;',
            '} else {',
            '  #{resultVar} = null;',
            '  if (reportFailures === 0) {',
            '    matchFailed(#{string(node.rawText)});',
            '  }',
            '}'
          ]
        };

    for (name in sources) {
      templates[name] = Codie.template(sources[name].join('\n'));
    }

    return templates;
  })();

  function fill(name, vars) {
    vars.string = quote;

    return templates[name](vars);
  }

  function resultVar(index) { return "result" + index; }
  function posVar(index)    { return "pos"    + index; }

  var emit = buildNodeVisitor({
    grammar: function(node) {
      var initializerCode = node.initializer !== null
        ? emit(node.initializer)
        : "";
      var name;

      var parseFunctionTableItems = [];
      for (name in node.rules) {
        parseFunctionTableItems.push(quote(name) + ": parse_" + name);
      }
      parseFunctionTableItems.sort();

      var parseFunctionDefinitions = [];
      for (name in node.rules) {
        parseFunctionDefinitions.push(emit(node.rules[name]));
      }

      return fill("grammar", {
        initializerCode:          initializerCode,
        parseFunctionTableItems:  parseFunctionTableItems,
        parseFunctionDefinitions: parseFunctionDefinitions,
        startRule:                node.startRule
      });
    },

    initializer: function(node) {
      return node.code;
    },

    rule: function(node) {
      var context = {
        resultIndex: 0,
        posIndex:    0,
        delta:       function(resultIndexDelta, posIndexDelta) {
          return {
            resultIndex: this.resultIndex + resultIndexDelta,
            posIndex:    this.posIndex    + posIndexDelta,
            delta:       this.delta
          };
        }
      };

      return fill("rule", {
        node:       node,
        resultVars: map(range(node.resultStackDepth), resultVar),
        posVars:    map(range(node.posStackDepth), posVar),
        code:       emit(node.expression, context),
        resultVar:  resultVar(context.resultIndex)
      });
    },

    /*
     * The contract for all code fragments generated by the following functions
     * is as follows.
     *
     * The code fragment tries to match a part of the input starting with the
     * position indicated in |pos|. That position may point past the end of the
     * input.
     *
     * * If the code fragment matches the input, it advances |pos| to point to
     *   the first chracter following the matched part of the input and sets
     *   variable with a name computed by calling
     *   |resultVar(context.resultIndex)| to an appropriate value. This value is
     *   always non-|null|.
     *
     * * If the code fragment does not match the input, it returns with |pos|
     *   set to the original value and it sets a variable with a name computed
     *   by calling |resultVar(context.resultIndex)| to |null|.
     *
     * The code can use variables with names computed by calling
     *
     *   |resultVar(context.resultIndex + i)|
     *
     * and
     *
     *   |posVar(context.posIndex + i)|
     *
     * where |i| >= 1 to store necessary data (return values and positions). It
     * won't use any other variables.
     */

    choice: function(node, context) {
      var code, nextAlternativesCode;

      for (var i = node.alternatives.length - 1; i >= 0; i--) {
        nextAlternativesCode = i !== node.alternatives.length - 1
          ? fill("choice.next", {
              code:      code,
              resultVar: resultVar(context.resultIndex)
            })
          : '';
        code = fill("choice", {
          currentAlternativeCode: emit(node.alternatives[i], context),
          nextAlternativesCode:   nextAlternativesCode
        });
      }

      return code;
    },

    sequence: function(node, context) {
      var elementResultVars = map(node.elements, function(element, i) {
        return resultVar(context.resultIndex + i);
      });

      var code = fill("sequence.inner", {
        resultVar:         resultVar(context.resultIndex),
        elementResultVars: elementResultVars
      });

      for (var i = node.elements.length - 1; i >= 0; i--) {
        code = fill("sequence.iteration", {
          elementCode:      emit(node.elements[i], context.delta(i, 1),
                                 elementResultVars.slice(0, i)),
          elementResultVar: elementResultVars[i],
          code:             code,
          posVar:           posVar(context.posIndex),
          resultVar:        resultVar(context.resultIndex)
        });
      }

      return fill("sequence", { code: code, posVar: posVar(context.posIndex) });
    },

    labeled: function(node, context) {
      return emit(node.expression, context);
    },

    simple_and: function(node, context) {
      return fill("simple_and", {
        expressionCode: emit(node.expression, context.delta(0, 1)),
        posVar:         posVar(context.posIndex),
        resultVar:      resultVar(context.resultIndex)
      });
    },

    simple_not: function(node, context) {
      return fill("simple_not", {
        expressionCode: emit(node.expression, context.delta(0, 1)),
        posVar:         posVar(context.posIndex),
        resultVar:      resultVar(context.resultIndex)
      });
    },

    semantic_and: function(node, context, previousResults) {
      var formalParams = [];
      var actualParams = [];
      if (node.previousElements !== undefined) {
        for (var i = 0; i < node.previousElements.length; i++) {
          var element = node.previousElements[i];
          if (element.type === "labeled") {
            formalParams.push(element.label);
            actualParams.push(previousResults[i]);
          }
        }
      }  
      return fill("semantic_and", {
        node:         node,
        resultVar:    resultVar(context.resultIndex),
        formalParams: formalParams,
        actualParams: actualParams
      });
    },

    semantic_not: function(node, context, previousResults) {
      var formalParams = [];
      var actualParams = [];
      if (node.previousElements !== undefined) {
        for (var i = 0; i < node.previousElements.length; i++) {
          var element = node.previousElements[i];
          if (element.type === "labeled") {
            formalParams.push(element.label);
            actualParams.push(previousResults[i]);
          }
        }
      }
      return fill("semantic_not", {
        node:         node,
        resultVar:    resultVar(context.resultIndex),
        formalParams: formalParams,
        actualParams: actualParams
      });
    },

    optional: function(node, context) {
      return fill("optional", {
        expressionCode: emit(node.expression, context),
        resultVar:      resultVar(context.resultIndex)
      });
    },

    zero_or_more: function(node, context) {
      return fill("zero_or_more", {
        expressionCode:      emit(node.expression, context.delta(1, 0)),
        expressionResultVar: resultVar(context.resultIndex + 1),
        resultVar:           resultVar(context.resultIndex)
      });
    },

    one_or_more: function(node, context) {
      return fill("one_or_more", {
        expressionCode:      emit(node.expression, context.delta(1, 0)),
        expressionResultVar: resultVar(context.resultIndex + 1),
        resultVar:           resultVar(context.resultIndex)
      });
    },

    action: function(node, context) {
      /*
       * In case of sequences, we splat their elements into function arguments
       * one by one. Example:
       *
       *   start: a:"a" b:"b" c:"c" { alert(arguments.length) }  // => 3
       *
       * This behavior is reflected in this function.
       */

      var formalParams;
      var actualParams;

      if (node.expression.type === "sequence") {
        formalParams = [];
        actualParams = [];

        each(node.expression.elements, function(element, i) {
          if (element.type === "labeled") {
            formalParams.push(element.label);
            actualParams.push(resultVar(context.resultIndex) + '[' + i + ']');
          }
        });
      } else if (node.expression.type === "labeled") {
        formalParams = [node.expression.label];
        actualParams = [resultVar(context.resultIndex)];
      } else {
        formalParams = [];
        actualParams = [];
      }

      formalParams.push("_chunk");
      actualParams.push("_chunk");

      return fill("action", {
        node:           node,
        expressionCode: emit(node.expression, context.delta(0, 1)),
        formalParams:   formalParams,
        actualParams:   actualParams,
        posVar:         posVar(context.posIndex),
        resultVar:      resultVar(context.resultIndex)
      });
    },

    rule_ref: function(node, context) {
      return fill("rule_ref", {
        node:      node,
        resultVar: resultVar(context.resultIndex)
      });
    },

    literal: function(node, context) {
      return fill("literal", {
        node:      node,
        resultVar: resultVar(context.resultIndex)
      });
    },

    any: function(node, context) {
      return fill("any", { resultVar: resultVar(context.resultIndex) });
    },

    "class": function(node, context) {
      var regexp;

      if (node.parts.length > 0) {
        regexp = '/^['
          + (node.inverted ? '^' : '')
          + map(node.parts, function(part) {
              return part instanceof Array
                ? quoteForRegexpClass(part[0])
                  + '-'
                  + quoteForRegexpClass(part[1])
                : quoteForRegexpClass(part);
            }).join('')
          + ']/' + (node.ignoreCase ? 'i' : '');
      } else {
        /*
         * Stupid IE considers regexps /[]/ and /[^]/ syntactically invalid, so
         * we translate them into euqivalents it can handle.
         */
        regexp = node.inverted ? '/^[\\S\\s]/' : '/^(?!)/';
      }

      return fill("class", {
        node:      node,
        regexp:    regexp,
        resultVar: resultVar(context.resultIndex)
      });
    }
  });

  return emit(ast);
};

if (typeof module === "object") {
  module.exports = PEG;
} else if (typeof window === "object") {
  window.PEG = PEG;
} else {
  throw new Error("Can't export PEG library (no \"module\" nor \"window\" object detected).");
}

})();