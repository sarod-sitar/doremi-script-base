 {
  /* Initializer. All the functions in this block are available */
  debug=false
  if (typeof module !== 'undefined' && module.exports) {
    // running under node.js
    sys = require('sys');
    _ = require("underscore")._;
    ParserHelper= require("./parser_helper.js").ParserHelper
  }
  Helper =ParserHelper
  if (debug) {
    console.log("Helper is",Helper)
  } 
  // Mix in the methods from Helper.
  // TODO: find a more elegant way to do this.
  // didn't work. _.extend(this, Helper) 
  extract_lyrics=Helper.extract_lyrics
  get_attribute=Helper.get_attribute
  mark_partial_measures= Helper.mark_partial_measures
  all_items_in_line=Helper.all_items_in_line 
  measure_dashes_at_beginning_of_beats= Helper.measure_dashes_at_beginning_of_beats
  measure_note_durations= Helper.measure_note_durations
  count_beat_subdivisions = Helper.count_beat_subdivisions
  parens_unbalanced = Helper.parens_unbalanced
  get_source_for_items = Helper.get_source_for_items
  measure_columns = Helper.measure_columns
  assign_attributes=Helper.assign_attributes
  collect_nodes = Helper.collect_nodes
  map_nodes = Helper.map_nodes
  my_inspect = Helper.my_inspect
  check_semantics=Helper.check_semantics
  log = Helper.log
  // end of mixin section
  warnings=[]
}


START "Grammar for AACM/Bhatkande style sargam/letter notation by John Rothfield 707 538-5133, cell 707 331-2700  john@rothfield.com"
  = COMPOSITION

EMPTY_LINE ""
= "\n" (" "* "\n")* { return {my_type: "logical_line_end"}
           }

HEADER_SECTION "Headers followed by blank lines or a logical line"
= attributes:ATTRIBUTE_LINE+ (EMPTY_LINE / EOF / "/n" / &LOGICAL_LINE )
     { return { my_type:"attributes",
                items: attributes,
                source: "TODO"
                }}

COMPOSITION "a musical piece  lines:LOGICAL_LINE+ "
= "\n"* EMPTY_LINE* attributes:HEADER_SECTION? lines:LOGICAL_LINE*  (EOF / EMPTY_LINE)
       { 
          if (attributes=="") {
             attributes=null
          }
          title="Untitled";
          this.log("in composition, attributes is")
          this.my_inspect(attributes);
          this.composition_data = { my_type:"composition",
                   title:title,
                   filename: "untitled",
                   attributes: attributes,
                   logical_lines: _.flatten(lines),
                   warnings:this.warnings,
                   source:"" // can't get input source here, put it in later
                  }
          // Certain attributes get set on the data object
          // TODO: dry
          x=get_attribute("Filename");
          if (x) {
            this.composition_data.filename =x 
          }
          x=get_attribute("Title");
          console.log("get_attribute title is",x)
          if (x) {
            this.composition_data.title =x 
          }
          this.mark_partial_measures()
          return composition_data
              }
ATTRIBUTE_LINE "ie Author: John Rothfield"
= key_chars:[a-zA-Z_\-0-9]+ ""? ":" blanks:_ value_chars:([^\n])+ _ ("\n" / &EOF)
     { return { my_type:"attribute",
                key: key_chars.join(''),
                value:value_chars.join(''),
                source: "todo"
                }}

LOGICAL_LINE_END "ss"
  = EMPTY_LINE+ / EOF


LOGICAL_LINE "multiple lines including syllables etc,delimited by empty line. There is an order, optional upper octave lines followed by main line of sargam followed by optional lyrics line"

  =
    uppers:UPPER_OCTAVE_LINE*
    sargam:SARGAM_LINE 
    lowers:LOWER_OCTAVE_LINE*
    lyrics:LYRICS_LINE?
    LOGICAL_LINE_END  { 
          if (lyrics.length==0) {
            lyrics='' 
          }
          if (lowers.length==0) {
            lowers='' 
          }
          if (uppers.length==0) {
            uppers='' 
          }
          my_items = _.flatten(_.compact([uppers,sargam,lowers,lyrics])),
           
          obj = { my_type: "logical_line",
                   sargam_line:sargam,
                   lyrics:lyrics,
                   warnings:[]
                 } 

          _.each(my_items,function(my_line) {
            this.measure_columns(my_line.items,0);
                    });
          my_uppers=_.flatten(_.compact([uppers]))
          my_lowers=_.flatten(_.compact([lowers]))
          attribute_lines=_.flatten(_.compact([uppers,lowers,lyrics]))
          this.assign_attributes(obj.sargam_line,attribute_lines)
          // var x= this.assign_from_lyrics(obj)
          return obj;
        }

UPPER_OCTAVE_LINE "can put upper octave dots or semicolons for upper upper octave (. or :). Also tala symbols +203"
  = items:UPPER_OCTAVE_LINE_ITEM+ LINE_END
      {
       my_items =  _.flatten(items)
       if (my_items.length == 0) {
         return ""
       }
       return {
               my_type:"upper_octave_line",
               source: this.get_source_for_items(items),
               items: my_items
              } 
      }


CHORD_SYMBOL "I IV V. TODO: review"
  = ! "+" chars:[a-gA-GmiMaIivV0-9+]+
          {
              source=chars.join('')
              return {
               my_type:"chord_symbol",
               source: source, 
              } 
  }

ALTERNATE_ENDING_INDICATOR "1._______ 2.___ etc. The period is optional. Must have either dot or underscores. TODO: accepts 1_.___ which is not exactly what I want."
= num:[1-3] underscores:[\._]+
    {
            console.log("underscores is",underscores)
            console.log('typeof dot is ', typeof(dot))
            console.log('typeof underscores is ', typeof(underscores))
            
            if (typeof(dot) == 'undefined') {
              dot=''
            }
            if (typeof(underscores) == 'undefined') {
              underscores=[]
            }
            source=_.flatten([num,dot,underscores]).join('')
            console.log("source is",source)
            return {
              my_type: "ending",
              source:source,
              num:parseInt(num)
      }
    }

UPPER_OCTAVE_LINE_ITEM "Things above notes, including talas, octaves,chords, and 1st and second ending symbols"
  =  WHITE_SPACE / 
     UPPER_OCTAVE_DOT /
     ALTERNATE_ENDING_INDICATOR /
     TALA /
     MORDENT /
     UPPER_UPPER_OCTAVE_SYMBOL /
     CHORD_SYMBOL 


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
BEGIN_SLUR "symbol for beginning a slur - we use left-paren ("
  = char:"(" { return { my_type: "begin_slur",
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
MEASURE "measures,note that beginning and end of line implicitly demarcates a measure"
  = start:BARLINE? items:NON_BARLINE+ end:(BARLINE / &LINE_END) 
        {
                if (start != "") {
                   items.unshift(start)
            }
                this.log("end.length is"+end.length);
                if (end != "") {
                   items.push(end)
            }
       var source = this.get_source_for_items(items);
       var obj= { my_type: "measure",
                        source:source,
                        items:items
                        }
         return obj;
             }
NON_BARLINE 
  =
    x:WHITE_SPACE /  
    x:BEAT_DELIMITED / 
    x:BEAT_UNDELIMITED / 
    x:SARGAM_PITCH / 
    x:RHYTHMICAL_DASH / 
    x:BEGIN_SLUR / 
    x:END_SLUR /
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
    x:BEGIN_SLUR / 
    x:END_SLUR /
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

SARGAM_LINE_OLD "main line, consisting of sargams, barlines,spaces, dashes,etc, terminated by EOF or EOL"
  = line_number:LINE_NUMBER? items:SARGAM_LINE_ITEM+ LINE_END
      {
       if (line_number !=''){
        items.unshift(line_number) 
       }
       source = this.get_source_for_items(items);
       my_items =  _.flatten(items)
       my_line = {
               line_number:line_number,
               my_type:"sargam_line",
               source: source,
               items: my_items
              } 
       if (this.parens_unbalanced(my_line)) {
         //TODO: collect warning here
         // ERROR
         //return null;
       }
       return my_line;
      }

SARGAM_LINE "consists of optional line# at beginning of line, followed by 1 or more measures followed by line end"
  = line_number:LINE_NUMBER?  items:MEASURE+ LINE_END
    {
       if (line_number !=''){
        items.unshift(line_number) 
       }
       source = this.get_source_for_items(items);
       my_items =  _.flatten(items)
       my_line = {
               line_number:line_number,
               my_type:"sargam_line",
               source: source,
               items: my_items
              } 
       if (this.parens_unbalanced(my_line)) {
         // ERROR
       //  return null;
       }
       // REVIEW this.tie_notes(my_line);
       this.measure_dashes_at_beginning_of_beats(my_line);
       return my_line;
      }

BEAT_UNDELIMITED "beats can be indicated by a group of pitches that consist only of pitches and dashes such as S--R--G-"
  = beat_items:BEAT_UNDELIMITED_ITEM+ 
        { 
            my_beat = { 
                   my_type:"beat",
                   source: this.get_source_for_items(beat_items),
                   items: beat_items
                   }
            my_beat.subdivisions=this.count_beat_subdivisions(my_beat)
            this.measure_note_durations(my_beat)
            return my_beat
                   
         }

BEAT_UNDELIMITED_ITEM "inside of a simple beat, ie S--R--G-"
  = SARGAM_PITCH / RHYTHMICAL_DASH / BEGIN_SLUR / END_SLUR
  
BEAT_DELIMITED "ie <S R G m> . Useful if lyrics wouldn't line up otherwise!. use <Srgm> or <S r g m> to group pithes into a single beat. The <> delimiters correspond to the lower loop in the aacm notation system"
  = begin_symbol:BEGIN_BEAT_SYMBOL beat_items:BEAT_DELIMITED_ITEM+ end_symbol:END_BEAT_SYMBOL
        { 
            beat_items.unshift(begin_symbol)
            beat_items.push(end_symbol)
            my_beat ={ 
                   my_type:"beat",
                   source: this.get_source_for_items(beat_items),
                   items: beat_items
                   }
            my_beat.subdivisions=this.count_beat_subdivisions(my_beat)
            this.measure_note_durations(my_beat)
            return my_beat;
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

BEAT_DELIMITED_ITEM "inside of a delimited beat, ie S--R--G-"
  = SARGAM_PITCH / RHYTHMICAL_DASH / BEGIN_SLUR / END_SLUR / WHITE_SPACE


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
  = letters:[a-zA-Z]+ optional_dash:'-'? whitespace:_ 
     { var syl = letters.join('') + optional_dash
       return _.compact([{ my_type:  "syllable",
                syllable: syl,
                source: syl 
              }, whitespace])
              }


LYRICS_LINE "line of syllables"
  = begin_whitespace:_? items:LYRICS_LINE_ITEM+ 
     end_white_space:_? LINE_END 
      {  items.unshift(begin_whitespace) 
         items.push(end_white_space)
         items= _.flatten(items)
         return {
           my_type:"lyrics_line",
           /* compact removes empty strings that whitespace returns */
           items:_.compact(items),
           source: ""
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


DEVANAGRI_SARGAM_CHAR "SRGMPDN in devanagri"
 = char:DEVANAGRI_SA / char:[\u0938\u0930\u095A\u092E\u092a\u0927\u0929] {
         return char;
 }
 
DEVANAGRI_SA "sa in devanagri"
 = char:"\u0938"

MUSICAL_CHAR  "Try and support multiple scripts here"
  = EXTENDED_SARGAM_CHAR / SARGAM_CHAR / DEVANAGRI_SARGAM_CHAR 

EXTENDED_SARGAM_CHAR "add to the usual sargam chars to get things like sa sharp and pa sharp. Needed to notate Yesterday by the beatles"
 = SA_FLAT / SA_SHARP / RE_SHARP / GA_SHARP / 
   PA_SHARP / DHA_SHARP / NI_SHARP / PA_FLAT

SARGAM_CHAR "ie SrRgG, and possibly the devanagri characters as well"
 = char:[SrRgGmMPdDnN] {
         return char;
 }
 
 SA_FLAT
  = "Sb"

 PA_FLAT
  = "Pb"

 SA_SHARP "I want S#!!! C#"
  = "S#"

 RE_SHARP
  = "R#"
 
 GA_SHARP
  = "G#"
  
 PA_SHARP
  = "P#"

 DHA_SHARP 
  = "D#"

 NI_SHARP
  = "N#"

 PA_FLAT
  = "Pb"

SARGAM_PITCH "a sargam pitch ie SrR.."
= slur:BEGIN_SLUR_OF_PITCH? char:MUSICAL_CHAR end_slur:END_SLUR_OF_PITCH?  
       { 
         source=char;  
         attributes=[]
          if (slur !='') {
                  source=slur.source + source
                  attributes.push(slur);
          }

          if (end_slur !='') {
                  source=source + end_slur.source
                  attributes.push(end_slur);
          }
       return {
       my_type: "pitch",
       attributes:attributes,
       source: source,
       pitch_source:char,
       begin_slur:  (slur !=''),
       end_slur: (end_slur !=''),
       octave: 0
          }
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
EOL "end of line"
  = "\n" { return { my_type: "end_of_line",
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

