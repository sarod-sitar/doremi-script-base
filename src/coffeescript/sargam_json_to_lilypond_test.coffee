root = exports ? this

debug=true
global._console ||= require('./underscore.logger.js') if global?
Logger=global._console.constructor
#_console.level  = Logger.DEBUG

_ = require("underscore")._ if require?
require './sargam_parser.js'
sys = require('sys')
utils=require './tree_iterators.js'
_console.level  = Logger.WARN
_.mixin(_console.toObject())

`_.mixin({
  each_slice: function(obj, slice_size, iterator, context) {
    var collection = obj.map(function(item) { return item; });
    
    if (typeof collection.slice !== 'undefined') {
      for (var i = 0, s = Math.ceil(collection.length/slice_size); i < s; i++) {
        iterator.call(context, _(collection).slice(i*slice_size, (i*slice_size)+slice_size), obj);
      }
    }
    return; 
  }
});`

to_lilypond=require('./sargam_json_to_lilypond.js').to_lilypond

parser=SargamParser

test_to_lilypond = (str,test,msg="") ->
  composition=parser.parse(str)
  composition.source=str
  #_.debug("test_parses:composition is #{composition}")
  _.debug("test_to_lilypond, str is \n#{str}\n")
  lily=to_lilypond(composition)
  composition.lilypond=lily
  _.debug("test_to_lilypond returned \n#{lily}\n")
  return lily 


test_data = [
  "S - -" ,
  "c'4~ c'2",
  "should combine whole empty beat within a measure"
  "S -- ---------" ,
  "c'4~ c'2",
  "should combine whole empty beat within a measure"


  ]
exports.test_all = (test) ->
  fun = (args) ->
    [str,expected,msg]= args
    lily=test_to_lilypond(str,test)
    console.log ("Testing #{str} -> #{expected}")
    test.ok(lily.indexOf(expected) > -1,"FAILED*** #{msg}. Expected output of #{str} to include #{expected}. Lilypond output was #{lily}" )
  _.each_slice(test_data,3,fun)
  test.done()

#exports.test_combines_whole_beat_rests_within_a_measure = (test) ->
#  debug=true
#  str = 'S - -'
#  lily=test_to_lilypond(str,test)
#  
#  test.done()
#
