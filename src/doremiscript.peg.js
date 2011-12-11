 /* PEG GRAMMAR for DoremiScript. 
  * Gets compiled into doremi_script_parser.js
  */

{
  /* Initializer. All the functions in this block are available */
  debug=false
  if (typeof module !== 'undefined' && module.exports) {
    // running under node.js
    zz = require('./shims.js');
    util = require('util');
    _ = require("underscore")._;
    shared=require('./shared.js')
    _.extend(root,shared)
    get_attribute=shared.get_attribute
    ParserHelper= require("./parser_helper.js").ParserHelper
    Fraction=require('./third_party/fraction.js').Fraction
  }
  Helper =ParserHelper
  // Mix in the methods from Helper.
  // TODO: find a more elegant way to do this.
  // didn't work. _.extend(this, Helper) 
  //
  id_ctr=1
  sa_helper=Helper.sa_helper
  parse_line=Helper.parse_line
  item_has_attribute=Helper.item_has_attribute
  trim=Helper.trim
  handle_ornament=Helper.handle_ornament
  find_ornaments=Helper.find_ornaments
  running_under_node=Helper.running_under_node
  map_ornaments=Helper.map_ornaments
  parse_ornament=Helper.parse_ornament
  parse_composition=Helper.parse_composition
  parse_sargam_pitch=Helper.parse_sargam_pitch
  parse_beat_delimited=Helper.parse_beat_delimited
  parse_beat_undelimited=Helper.parse_beat_undelimited
  parse_measure=Helper.parse_measure
  parse_sargam_line=Helper.parse_sargam_line
  extract_lyrics=Helper.extract_lyrics
  mark_partial_measures= Helper.mark_partial_measures
  measure_dashes_at_beginning_of_beats= Helper.measure_dashes_at_beginning_of_beats
  measure_note_durations= Helper.measure_note_durations
  count_beat_subdivisions = Helper.count_beat_subdivisions
  parens_unbalanced = Helper.parens_unbalanced
  //get_attribute=Helper.get_attribute
  get_source_for_items = Helper.get_source_for_items
  measure_columns = Helper.measure_columns
  assign_attributes=Helper.assign_attributes
  assign_lyrics=Helper.assign_lyrics
  collect_nodes = Helper.collect_nodes
  map_nodes = Helper.map_nodes
  my_inspect = Helper.my_inspect
  check_semantics=Helper.check_semantics
  measure_pitch_durations=Helper.measure_pitch_durations
  if (typeof require !== 'undefined') {
    // x=require('./tree_iterators.js')
    all_items=require('./all_items.js').all_items
  }
  log = Helper.log
  // end of mixin section
  warnings=[]
}


START "Grammar for AACM/Bhatkande style sargam/letter notation by John Rothfield 707 538-5133, cell 707 331-2700  john@rothfield.com"
  = COMPOSITION
  //= UPPER_OCTAVE_LINE

EMPTY_LINE ""
= "\n" / " "* LINE_END_CHAR (" "* LINE_END_CHAR)* { return {my_type: "line_end"}
           }

HEADER_SECTION "Headers followed by blank lines or a line"
= attributes:ATTRIBUTE_LINE+ (EMPTY_LINE+ / EOF / "/n" / &LINE )
     { return { my_type:"attributes",
                items: attributes,
                source: "TODO"
                }}

COMPOSITION "a musical piece  lines:LINE+ "
= LINE_END_CHAR* EMPTY_LINE* attributes:HEADER_SECTION? lines:LINE*  (EOF / EMPTY_LINE)
       { 
          return parse_composition(attributes,lines)
      }
ATTRIBUTE_LINE "ie Author: John Rothfield"
= key_chars:[a-zA-Z_\-0-9]+ ""? ":" blanks:_ value_chars:([^\n\r])+ _ (LINE_END_CHAR / &EOF)
     { return { my_type:"attribute",
                key: key_chars.join(''),
                value:this.trim(value_chars.join('')),
                source: "todo"
                }}

LINE_END "ss"
  = EMPTY_LINE+ / EOF


COMPOUND_LINE 
  =
    uppers:UPPER_OCTAVE_LINE*
    sargam:(sargam:DEVANAGRI_SARGAM_LINE / sargam:SARGAM_LINE / sargam:ABC_SARGAM_LINE/ sargam:NUMBER_SARGAM_LINE)
    lowers:LOWER_OCTAVE_LINE*
    lyrics:LYRICS_LINE?
    LINE_END   
    EMPTY_LINE*
    {
          return parse_line(uppers,sargam,lowers,lyrics)
        }

LINE "main line of music. multiple lines including syllables etc,delimited by empty line. There is an order, optional upper octave lines followed by main line of sargam followed by optional lyrics line"
  = COMPOUND_LINE / SIMPLE_LINE

SIMPLE_LINE
  =
    sargam:(sargam:DEVANAGRI_SARGAM_LINE / sargam:SARGAM_LINE / sargam:ABC_SARGAM_LINE/ sargam:NUMBER_SARGAM_LINE)
    lowers:LOWER_OCTAVE_LINE*
    lyrics:LYRICS_LINE?
    LINE_END 
    EMPTY_LINE*
    { 
          uppers=''
          return parse_line(uppers,sargam,lowers,lyrics)
    }

SARGAM_ORNAMENT "in upper line NRSNS"
  = items:SARGAM_ORNAMENT_ITEM+ 
        { 
            return parse_ornament("",items,"")
         }


DELIMITED_SARGAM_ORNAMENT "in upper line <NRSNS>"
  = left_delimiter:"<" items:SARGAM_ORNAMENT_ITEM+  right_delimiter:">"
        { 
            return parse_ornament(left_delimiter,items,right_delimiter)
         }

SARGAM_ORNAMENT_ITEM
  = SARGAM_PITCH 

UPPER_OCTAVE_LINE "can put upper octave dots or semicolons for upper upper octave (. or :). Also tala symbols +203"
  = begin_white_space:WHITE_SPACE? items:UPPER_OCTAVE_LINE_ITEM+ end_white_space:WHITE_SPACE? LINE_END
      {
         my_items =  _.compact(_.flatten([begin_white_space, items,end_white_space]))
       return {
               my_type:"upper_octave_line",
               source: this.get_source_for_items(my_items),
               items: my_items
              } 
      }


FORWARD_SLASH_CHAR  "note that putting forward slash in regex doesn't seem to work"
  = "\u002F"

CHORD_SYMBOL_CHAR
  = char:[a-gA-GmiMaIivV0-9+] / char:FORWARD_SLASH_CHAR

CHORD_SYMBOL_INITIAL_CHAR
 = char:[a-gA-GvViI]

CHORD_SYMBOL "I IV V. Put in lookahead for 3 sargam chars. "
  =  !([SrRgGmMPdDnN] [SrRgGmMPdDnN] [SrRgGmMPdDnN])
  initial:CHORD_SYMBOL_INITIAL_CHAR chars:CHORD_SYMBOL_CHAR*
          {
              source=initial + chars.join('')
              return {
               my_type:"chord_symbol",
               source: source, 
              } 
  }

ALTERNATE_ENDING_INDICATOR "1._______ 2.___ etc. The period is optional. Must have either dot or underscores. TODO: accepts 1_.___ which is not exactly what I want."
= num:[1-3] underscores:[\._]+
    {
            if (typeof(dot) == 'undefined') {
              dot=''
            }
            if (typeof(underscores) == 'undefined') {
              underscores=[]
            }
            source=_.flatten([num,dot,underscores]).join('')
            return {
              my_type: "ending",
              source:source,
              num:parseInt(num)
      }
    }

UPPER_OCTAVE_LINE_ITEM "Things above notes, including talas, octaves,chords, and 1st and second ending symbols"
  =  
     DELIMITED_SARGAM_ORNAMENT  / 
     WHITE_SPACE / 
     UPPER_OCTAVE_DOT /
     ALTERNATE_ENDING_INDICATOR /
     TALA /
     MORDENT /
     UPPER_UPPER_OCTAVE_SYMBOL /
     CHORD_SYMBOL /
     SARGAM_ORNAMENT  


LOWER_OCTAVE_LINE "can put lower octave dots or semicolons for lower-lower octave (. or :)"
  = items:LOWER_OCTAVE_LINE_ITEM+ LINE_END
      {
       my_items =  _.flatten(items)
       if (my_items.length == 0) {
         return ""
       }
       return {
               my_type:"lower_octave_line",
               source: this.get_source_for_items(items),
               items: my_items
              } 
      }



KOMMAL_INDICATOR "For the traditional bhatkande notation. for devanagri, indicates a flatted note, since devanagri seems not to have lowercase"
 = char:"_" 
 { return { my_type: "kommal_indicator",
                        source:char,
                        }
                }
LOWER_OCTAVE_LINE_ITEM ".: for now"
  = WHITE_SPACE /
    LOWER_OCTAVE_DOT /
    LOWER_LOWER_OCTAVE_SYMBOL /
    KOMMAL_INDICATOR 

LOWER_OCTAVE_DOT 
  = char:[\.*] { return { my_type: "lower_octave_indicator",
                        source:char,
                        octave:-1
                        }
             }
UPPER_UPPER_OCTAVE_SYMBOL
  = char:":" { return { my_type: "upper_upper_octave_indicator",
                        source:char,
                        octave:2
                        }
             }

LOWER_LOWER_OCTAVE_SYMBOL
  = char:":" { return { my_type: "lower_lower_octave_indicator",
                        source:char,
                        octave:-2
                        }
             }

MORDENT =
  char:"~" 
     { return { my_type: "mordent",
                source:char
              }
     }
TALA "tala markings. ie +203 for tintal. 012 for rupak"
  = char:[+1203456]
     { return { my_type: "tala",
                source:char
     }
             }

END_SLUR "symbol for end of a slur - a right paren"
  = char:")" { return { my_type: "end_slur",
                        source:char
                        }
             }
BEGIN_SLUR_OF_PITCH "symbol for beginning a slur - we use left-paren ("
  = char:"(" { return { my_type: "begin_slur",
                        source:char
                        }
             }
END_SLUR_OF_PITCH "symbol for end of a slur - a right paren"
  = char:")" { return { my_type: "end_slur",
                        source:char
                        }
             }

UPPER_OCTAVE_DOT 
  = char:[\.*] { 
          return { my_type: "upper_octave_indicator",
                        source:char,
                        octave:1
                        }
             }

ABC_MEASURE "measures,note that beginning and end of line implicitly demarcates a measure"
  = start_obs:BARLINE? items:ABC_NON_BARLINE+ end_obs:(BARLINE / &LINE_END) 
        {

          return parse_measure(start_obs,items,end_obs)
             }

NUMBER_MEASURE "measures,note that beginning and end of line implicitly demarcates a measure"
  = start_obs:BARLINE? items:NUMBER_NON_BARLINE+ end_obs:(BARLINE / &LINE_END) 
        {
          return parse_measure(start_obs,items,end_obs)
             }
DEVANAGRI_MEASURE "measures,note that beginning and end of line implicitly demarcates a measure"
  = start_obs:BARLINE? items:DEVANAGRI_NON_BARLINE+ end_obs:(BARLINE / &LINE_END) 
        {
          return parse_measure(start_obs,items,end_obs)
             }
MEASURE "measures,note that beginning and end of line implicitly demarcates a measure"
  = start_obs:BARLINE? items:NON_BARLINE+ end_obs:(BARLINE / &LINE_END ) 
        {
          return parse_measure(start_obs,items,end_obs)
        }

ABC_NON_BARLINE 
  =
    x:WHITE_SPACE /  
    x:ABC_BEAT_DELIMITED / 
    x:ABC_BEAT_UNDELIMITED / 
    x:ABC_SARGAM_PITCH / 
    x:RHYTHMICAL_DASH / 
    x:REPEAT_SYMBOL {
            x.attributes=[];
            return x;
    }

NUMBER_NON_BARLINE 
  =
    x:WHITE_SPACE /  
    x:NUMBER_BEAT_DELIMITED / 
    x:NUMBER_BEAT_UNDELIMITED / 
    x:NUMBER_SARGAM_PITCH / 
    x:RHYTHMICAL_DASH / 
    x:REPEAT_SYMBOL {
            x.attributes=[];
            return x;
    }
DEVANAGRI_NON_BARLINE 
  =
    x:WHITE_SPACE /  
    x:DEVANAGRI_BEAT_DELIMITED / 
    x:DEVANAGRI_BEAT_UNDELIMITED / 
    x:DEVANAGRI_SARGAM_PITCH / 
    x:RHYTHMICAL_DASH / 
    x:REPEAT_SYMBOL {
            x.attributes=[];
            return x;
    }
NON_BARLINE 
  =
    x:WHITE_SPACE /  
    x:BEAT_DELIMITED / 
    x:BEAT_UNDELIMITED / 
    x:SARGAM_PITCH / 
    x:RHYTHMICAL_DASH / 
    x:REPEAT_SYMBOL {
            x.attributes=[];
            return x;
    }

SARGAM_LINE_ITEM  "an item in the main line"
  = x:MEASURE /
    x:WHITE_SPACE /  
    x:BEAT_DELIMITED / 
    x:BEAT_UNDELIMITED / 
    x:SARGAM_PITCH / 
    x:RHYTHMICAL_DASH / 
    x:BARLINE / 
    x:REPEAT_SYMBOL {
            x.attributes=[];
            return x;
    }


 LINE_NUMBER "ie 1) 2) 3) etc"
 = digits:[\*0-9]+ ch:")"
   {
           source= digits.join('') + ")" 
          return { my_type: "line_number",
                   source:source,
                 }
             }


ABC_SARGAM_LINE "consists of optional line# at beginning of line, followed by 1 or more measures followed by line end"
  = line_number:LINE_NUMBER?  items:ABC_MEASURE+ LINE_END
    {
       return parse_sargam_line(line_number,items,"ABC")
    }


DEVANAGRI_SARGAM_LINE "consists of optional line# at beginning of line, followed by 1 or more measures followed by line end"
  = line_number:LINE_NUMBER?  items:DEVANAGRI_MEASURE+ LINE_END
    {
       return parse_sargam_line(line_number,items,"devanagri")
    }

NUMBER_SARGAM_LINE "consists of optional line# at beginning of line, followed by 1 or more measures followed by line end"
  = line_number:LINE_NUMBER?  items:NUMBER_MEASURE+ LINE_END
    {
       return parse_sargam_line(line_number,items,"number")
    }
SARGAM_LINE "consists of optional line# at beginning of line, followed by 1 or more measures followed by line end"
  = line_number:LINE_NUMBER?  items:MEASURE+ LINE_END
    {
       return parse_sargam_line(line_number,items,"latin_sargam")
      }

NUMBER_BEAT_UNDELIMITED "beats can be indicated by a group of pitches that consist only of pitches and dashes such as S--R--G-"
  = beat_items:NUMBER_BEAT_UNDELIMITED_ITEM+ 
        { 
            return parse_beat_undelimited(beat_items)
         }
ABC_BEAT_UNDELIMITED "beats can be indicated by a group of pitches that consist only of pitches and dashes such as S--R--G-"
  = beat_items:ABC_BEAT_UNDELIMITED_ITEM+ 
        { 
            return parse_beat_undelimited(beat_items)
         }

BEAT_UNDELIMITED "beats can be indicated by a group of pitches that consist only of pitches and dashes such as S--R--G-"
  = beat_items:BEAT_UNDELIMITED_ITEM+ 
        { 
            return parse_beat_undelimited(beat_items)
         }
DEVANAGRI_BEAT_UNDELIMITED "beats can be indicated by a group of pitches that consist only of pitches and dashes such as S--R--G-"
  = beat_items:DEVANAGRI_BEAT_UNDELIMITED_ITEM+ 
    { 
      return parse_beat_undelimited(beat_items)
    }

NUMBER_BEAT_UNDELIMITED_ITEM "1--2--3-"
  = NUMBER_SARGAM_PITCH / RHYTHMICAL_DASH 

ABC_BEAT_UNDELIMITED_ITEM "C--D--E-"
  = ABC_SARGAM_PITCH / RHYTHMICAL_DASH 

DEVANAGRI_BEAT_UNDELIMITED_ITEM "inside of a simple beat, ie S--R--G-"
  = DEVANAGRI_SARGAM_PITCH / RHYTHMICAL_DASH



UNDELIMITED_SARGAM_PITCH_WITH_DASHES "for example S--"
  = pitch:SARGAM_PITCH dashes:RHYTHMICAL_DASH+
      {
         pitch.numerator=dashes.length+1
         return([pitch].concat(dashes))
      }


BEAT_UNDELIMITED_ITEM "inside of a simple beat, ie S--R--G- Note that undelimited beats cannot contain spaces"
  = UNDELIMITED_SARGAM_PITCH_WITH_DASHES /
    SARGAM_PITCH /
    RHYTHMICAL_DASH 
  
ABC_BEAT_DELIMITED "ie <C D E F> ."
  = begin_symbol:BEGIN_BEAT_SYMBOL beat_items:ABC_BEAT_DELIMITED_ITEM+ end_symbol:END_BEAT_SYMBOL
        { 
          return parse_beat_delimited(begin_symbol,beat_items,end_symbol)
         }

NUMBER_BEAT_DELIMITED "ie <1 2 3> . Useful if lyrics wouldn't line up otherwise!. use <Srgm> or <S r g m> to group pithes into a single beat. The <> delimiters correspond to the lower loop in the aacm notation system"
  = begin_symbol:BEGIN_BEAT_SYMBOL beat_items:NUMBER_BEAT_DELIMITED_ITEM+ end_symbol:END_BEAT_SYMBOL
        { 
          return parse_beat_delimited(begin_symbol,beat_items,end_symbol)
         }
DEVANAGRI_BEAT_DELIMITED "ie <S R G m> . Useful if lyrics wouldn't line up otherwise!. use <Srgm> or <S r g m> to group pithes into a single beat. The <> delimiters correspond to the lower loop in the aacm notation system"
  = begin_symbol:BEGIN_BEAT_SYMBOL beat_items:DEVANAGRI_BEAT_DELIMITED_ITEM+ end_symbol:END_BEAT_SYMBOL
        { 
          return parse_beat_delimited(begin_symbol,beat_items,end_symbol)
         }

BEAT_DELIMITED "ie <S R G m> . Useful if lyrics wouldn't line up otherwise!. use <Srgm> or <S r g m> to group pithes into a single beat. The <> delimiters correspond to the lower loop in the aacm notation system"
  = begin_symbol:BEGIN_BEAT_SYMBOL beat_items:BEAT_DELIMITED_ITEM+ end_symbol:END_BEAT_SYMBOL
        { 
          return parse_beat_delimited(begin_symbol,beat_items,end_symbol)
         }

BEGIN_BEAT_SYMBOL  "symbol to use to indicate start of beat"
  = char:"<" { return {
                         my_type: "begin_beat",
                         source: char
                      }
             }
END_BEAT_SYMBOL  "Symbol to use to indicate end of beat"
  = char:">" { return {
                         my_type: "end_beat",
                         source: char
                      }
             }
ABC_BEAT_DELIMITED_ITEM "inside of a delimited beat, ie C--D--E-"
  = 
  ABC_SARGAM_PITCH /
  RHYTHMICAL_DASH /
  WHITE_SPACE

NUMBER_BEAT_DELIMITED_ITEM "inside of a delimited beat, ie 1--3--2-"
  = 
  NUMBER_SARGAM_PITCH /
  RHYTHMICAL_DASH /
  WHITE_SPACE

DEVANAGRI_BEAT_DELIMITED_ITEM "inside of a delimited beat, ie S--R--G-"
  = DEVANAGRI_SARGAM_PITCH / RHYTHMICAL_DASH / WHITE_SPACE

BEAT_DELIMITED_ITEM "inside of a delimited beat, ie S--R--G-"
  = SARGAM_PITCH / RHYTHMICAL_DASH / WHITE_SPACE


WORD "a non-syllable like john"
  = letters:[a-zA-Z]+ WORD_TERMINATOR { return { my_type: "word",
                                                  word: letters.join("")
                                                 }
                                     }

_ "whitespace"                                                              
  = blanks:SPACE*  { if (blanks.length==0) {
                        return '' 
                     }
                     return { my_type:"whitespace",
                             source: blanks.join('')
                             }
                             }


WORD_TERMINATOR "marks end of word"
  = WHITE_SPACE 

SYLLABLE "for example he- or world"
  = letters:[a-zA-Z'!]+ optional_dash:'-'? whitespace:_ 
     { var syl = letters.join('') + optional_dash
       return _.compact([{ my_type:  "syllable",
                syllable: syl,
                source: syl 
              }, whitespace])
              }


LYRICS_LINE "line of syllables"
  = begin_white_space:WHITE_SPACE? 
    items:LYRICS_LINE_ITEM+ 
    end_white_space:WHITE_SPACE? LINE_END 

      {  
         my_items =  _.compact(_.flatten([begin_white_space, items,end_white_space]))
         return {
           my_type:"lyrics_line",
           items:my_items,
           source: this.get_source_for_items(my_items),
              }
      }


LYRICS_LINE_ITEM "items in lyrics line, ie a word or a syllable. ie he-llo john gives 3 items, 3 syllables . Don't distinguish he- from john"
  = SYLLABLE


 
RHYTHMICAL_DASH "ie a -, used as a rhythmical placeholder. IE S--R--G- "
  = source:"-" { 
                 return { my_type: "dash",
                   source: "-"
                      }
                } 


 
DEVANAGRI_SA "sa in devanagri"
  = char:"\u0938" 
    { return sa_helper(char,"C")
     }
DEVANAGRI_RE "re in devanagri"
  = char:"\u0930"
    { return sa_helper(char,"D") }
DEVANAGRI_GA "ga in devanagri"
  = char:"\u095A"
    { return sa_helper(char,"E") }
DEVANAGRI_MA_SHARP "tivra ma in devanagri. NOTE THE TICK!!!!"
  = char:"\u092E'" 
    { return sa_helper(char,"F#") }
DEVANAGRI_MA "ma in devanagri"
  = char:"\u092E"
    { return sa_helper(char,"F") }
DEVANAGRI_PA "pa in devanagri"
  = char:"\u092a"
    { return sa_helper(char,"G") }
DEVANAGRI_DHA "dha in devanagri"
  = char:"\u0927"
    { return sa_helper(char,"A") }
DEVANAGRI_NI "ni in devanagri"
  = char:"\u0929"
    { return sa_helper(char,"B") }

ABC_MUSICAL_CHAR  
  = 
  ABC_CSHARP /
  ABC_CFLAT /
  ABC_DFLAT /
  ABC_DSHARP /
  ABC_EFLAT /
  ABC_FSHARP /
  ABC_GFLAT /
  ABC_GSHARP /
  ABC_AFLAT /
  ABC_ASHARP /
  ABC_BFLAT /
  ABC_BSHARP /
  ABC_C /
  ABC_D /
  ABC_E /
  ABC_F /
  ABC_G /
  ABC_A /
  ABC_B 
  
ABC_C 
  = char:"C"
  { return sa_helper(char,"C") }
ABC_D
  = char:"D"
  { return sa_helper(char,"D") }
ABC_E
  = char:"E"
    { return sa_helper(char,"E") }
ABC_F 
  = char:"F"
    { return sa_helper(char,"F") }
ABC_G 
  = char:"G"
    { return sa_helper(char,"G") }
ABC_A
  = char:"A"
    { return sa_helper(char,"A") }
ABC_B
  = char:"B"
    { return sa_helper(char,"B") }
ABC_CSHARP 
  = char:"C#"
    { return sa_helper(char,"C#") }
ABC_CFLAT 
  = char:"Cb"
    { return sa_helper(char,"Cb") }
ABC_DFLAT 
  = char:"Db"
    { return sa_helper(char,"Db") }
ABC_DSHARP 
  = char:"D#"
    { return sa_helper(char,"D#") }
ABC_EFLAT 
  = char:"Eb"
    { return sa_helper(char,"Eb") }
ABC_FSHARP 
  = char:"F#"
    { return sa_helper(char,"F#") }
ABC_GFLAT 
  = char:"Gb"
    { return sa_helper(char,"Gb") }
ABC_GSHARP 
  = char:"G#"
    { return sa_helper(char,"G#") }
ABC_AFLAT 
  = char:"Ab"
    { return sa_helper(char,"Ab") }
ABC_ASHARP 
  = char:"A#"
    { return sa_helper(char,"A#") }
ABC_BFLAT 
  = char:"Bb"
    { return sa_helper(char,"Bb") }
ABC_BSHARP 
  = char:"B#"
    { return sa_helper(char,"B#") }

NUMBER_MUSICAL_CHAR  
  = 
  NUMBER_CSHARP /
  NUMBER_CFLAT /
  NUMBER_DFLAT /
  NUMBER_DSHARP /
  NUMBER_EFLAT /
  NUMBER_ESHARP / 
  // TODO: REVIEW ESHARP
  NUMBER_FFLAT /
  NUMBER_FSHARP /
  NUMBER_GFLAT /
  NUMBER_GSHARP /
  NUMBER_AFLAT /
  NUMBER_ASHARP /
  NUMBER_BFLAT /
  NUMBER_BSHARP /
  NUMBER_C /
  NUMBER_D /
  NUMBER_E /
  NUMBER_F /
  NUMBER_G /
  NUMBER_A /
  NUMBER_B 
  
NUMBER_C 
  = char:"1"
  { return sa_helper(char,"C") }
NUMBER_D
  = char:"2"
  { return sa_helper(char,"D") }
NUMBER_E
  = char:"3"
    { return sa_helper(char,"E") }
NUMBER_F 
  = char:"4"
    { return sa_helper(char,"F") }
NUMBER_G 
  = char:"5"
    { return sa_helper(char,"G") }
NUMBER_A
  = char:"6"
    { return sa_helper(char,"A") }
NUMBER_B
  = char:"7"
    { return sa_helper(char,"B") }
NUMBER_CSHARP 
  = char:"1#"
    { return sa_helper(char,"C#") }
NUMBER_CFLAT 
  = char:"1b"
    { return sa_helper(char,"Cb") }
NUMBER_DFLAT 
  = char:"2b"
    { return sa_helper(char,"Db") }
NUMBER_DSHARP 
  = char:"2#"
    { return sa_helper(char,"D#") }
NUMBER_EFLAT 
  = char:"3b"
    { return sa_helper(char,"Eb") }
NUMBER_ESHARP 
  = char:"3#"
    { return sa_helper(char,"E#") }
NUMBER_FFLAT 
// TODO:REVIEW
  = char:"4b"
    { return sa_helper(char,"Fb") }
NUMBER_FSHARP 
  = char:"4#"
    { return sa_helper(char,"F#") }
NUMBER_GFLAT 
  = char:"5b"
    { return sa_helper(char,"Gb") }
NUMBER_GSHARP 
  = char:"5#"
    { return sa_helper(char,"G#") }
NUMBER_AFLAT 
  = char:"6b"
    { return sa_helper(char,"Ab") }
NUMBER_ASHARP 
  = char:"6#"
    { return sa_helper(char,"A#") }
NUMBER_BFLAT 
  = char:"7b"
    { return sa_helper(char,"Bb") }
NUMBER_BSHARP 
  = char:"7#"
    { return sa_helper(char,"B#") }




DEVANAGRI_MUSICAL_CHAR  "devanagri characters."
  = 
  DEVANAGRI_SA /
  DEVANAGRI_RE /
  DEVANAGRI_GA /
  DEVANAGRI_MA_SHARP /
  DEVANAGRI_MA /
  DEVANAGRI_PA /
  DEVANAGRI_DHA /
  DEVANAGRI_NI 

SARGAM_MUSICAL_CHAR  "Letters SrRgGmMPdDnN in latin script"
  = 
  SARGAM_SA_FLAT /
  SARGAM_SA_SHARP /
  SARGAM_RE_SHARP /
  SARGAM_GA_SHARP /
  SARGAM_PA_SHARP /
  SARGAM_PA_FLAT /
  SARGAM_DHA_SHARP /
  SARGAM_NI_SHARP
  SARGAM_PA_FLAT /
  SARGAM_SA /
  SARGAM_RE_FLAT /
  SARGAM_RE /
  SARGAM_GA_FLAT /
  SARGAM_GA /
  SARGAM_MA /
  SARGAM_MA_SHARP /
  SARGAM_PA /
  SARGAM_DHA_FLAT /
  SARGAM_DHA /
  SARGAM_NI_FLAT /
  SARGAM_NI 


ABC_SARGAM_CHAR "ie SrRgG, and possibly the devanagri characters as well"
 = char:[CDEFGAB] {
         return char;
 }

SARGAM_SA
 = char:"S"
     {return sa_helper(char,"C")}

SARGAM_SA_FLAT
 = char:"Sb"
     {return sa_helper(char,"Cb")}

SARGAM_SA_SHARP
 = char:"S#"
     {return sa_helper(char,"C#")}

SARGAM_RE_FLAT
 = char:"r"
     {return sa_helper(char,"Db")}

SARGAM_RE
 = char:"R"
     {return sa_helper(char,"D")}

SARGAM_RE_SHARP
 = char:"R#"
     {return sa_helper(char,"D#")}

SARGAM_GA_SHARP
 = char:"G#"
     {return sa_helper(char,"E#")}

SARGAM_GA_FLAT
 = char:"g"
     {return sa_helper(char,"Eb")}

SARGAM_GA
 = char:"G"
     {return sa_helper(char,"E")}

SARGAM_MA
 = char:"m"
     {return sa_helper(char,"F")}

SARGAM_MA_SHARP
 = char:"M"
     {return sa_helper(char,"F#")}

SARGAM_PA
 = char:"P"
     {return sa_helper(char,"G")}

SARGAM_PA_FLAT
 = char:"Pb"
     {return sa_helper(char,"Gb")}

SARGAM_PA_SHARP
 = char:"P#"
     {return sa_helper(char,"G#")}

SARGAM_DHA_FLAT
 = char:"d"
     {return sa_helper(char,"Ab")}

SARGAM_DHA
 = char:"D"
     {return sa_helper(char,"A")}

SARGAM_DHA_SHARP
 = char:"D#"
     {return sa_helper(char,"A#")}

SARGAM_NI_FLAT
 = char:"n"
     {return sa_helper(char,"Bb")}

SARGAM_NI
 = char:"N"
     {return sa_helper(char,"B")}

SARGAM_NI_SHARP
 = char:"N#"
     {return sa_helper(char,"B#")}


NUMBER_SARGAM_PITCH "ie 123"
= slur:BEGIN_SLUR_OF_PITCH? char:NUMBER_MUSICAL_CHAR end_slur:END_SLUR_OF_PITCH?  
       { 
          return parse_sargam_pitch(slur,char,end_slur)
       }
ABC_SARGAM_PITCH "ie CDE"
= slur:BEGIN_SLUR_OF_PITCH? char:ABC_MUSICAL_CHAR end_slur:END_SLUR_OF_PITCH?  
       { 
          return parse_sargam_pitch(slur,char,end_slur)
       }


DEVANAGRI_SARGAM_PITCH "a sargam pitch ie SrR.."
= slur:BEGIN_SLUR_OF_PITCH? char:DEVANAGRI_MUSICAL_CHAR end_slur:END_SLUR_OF_PITCH?  
       { 
          return parse_sargam_pitch(slur,char,end_slur)
       }


SARGAM_PITCH "a sargam pitch ie SrR.."
= slur:BEGIN_SLUR_OF_PITCH? char:SARGAM_MUSICAL_CHAR end_slur:END_SLUR_OF_PITCH?  
       { 
          return parse_sargam_pitch(slur,char,end_slur)
       }

REPEAT_SYMBOL "ie %"                       
  = str:"%"
    { return { my_type:"repeat_symbol",
                     source: str,
                      }
              }

BARLINE  "a musical barline or repeat"
  = 
  barline:REVERSE_FINAL_BARLINE / 
  barline:FINAL_BARLINE / 
  barline:DOUBLE_BARLINE / 
  barline:LEFT_REPEAT / 
  barline:RIGHT_REPEAT / 
  barline:SINGLE_BARLINE 
  { return barline}

REVERSE_FINAL_BARLINE "ie [|, a reverse final barline"
  = str:'[|' { return { my_type:"reverse_final_barline",
                  source: str,
                 is_barline:true
                }
              }

FINAL_BARLINE "ie ||, a final barline"
  = str:'|]' { return { my_type:"final_barline",
                    source: str,
                    is_barline:true
                  }
              }

DOUBLE_BARLINE "ie ||, a solid barline"
  = str:'||' { return { my_type:"double_barline",
                     source: str,
                    is_barline:true
                      }
              }

SINGLE_BARLINE "ie |"
  = str:'\|' { return { my_type: "single_barline",
                   is_barline:true,
                  source: str
                   }
        }
LEFT_REPEAT "ie |:"
  = '\|:' { return { my_type: "left_repeat",
                   is_barline:true,
                  source: "|:"
                   }
        }

RIGHT_REPEAT "ie :|"
  = ':\|' { return { my_type: "right_repeat",
                     is_barline:true,
                     source: ":|"
                   }
        }
LINE_END "eol or eof"
  =  &EOF / EOL

LINE_END_CHAR= "\r\n" / "\r" / "\n"

EOL "end of line"
  = LINE_END_CHAR { return { my_type: "end_of_line",
                    source: "\n"
                    }}
EOF "end of file"
  = !. { return { my_type: "end_of_file",
                  source: "" }}

SPACE  "space or tab char"
  = char:" " 

WHITE_SPACE "white space"
   = spaces:SPACE+ { return { my_type: "whitespace",
                     source: spaces.join("")
                     }
                     }




