# Uses module pattern, exports to_musicxml
# Usage:
# to_musicxml(composition_json_data)
# IMPORTANT: need to set templates.composition externally

root = exports ? this

fs= require 'fs' if require?
Handlebars=require 'handlebars' if require?
if require?
  shared=require('./shared.js')
  root._ = require("underscore")._
  root._.extend(root,shared)

# Use templating system built into underscore.js
# Set it to use mustache style interpolation using
# {{}}
#
root._.templateSettings = {
          interpolate : /\{\{(.+?)\}\}/g
}

# Store the templates used in this object
# 
templates={}


load_composition_mustache_from_file_system = () ->
  # composition.mustache contains alot of boilerplate. Keep it in the file
  # system rather than cluttering up the code here .
  # otherwise, let the browser app install it-see application.js. 
  # TODO: find different mechanism to do this
  #
  if require?
    templates.composition = root._.template(fs.readFileSync(__dirname + '/composition.mustache', 'UTF-8'))

load_composition_mustache_from_file_system()

debug=true

fraction_to_musicxml_type_and_dots =
  "2/1":"<type>half</type>"
  "3/1":"<type>half</type><dot/>"
  "4/1":"<type>whole</type>"
  "5/1":"<type>whole</type><dot/><dot/>"
  "1/2":"<type>eighth</type>"
  "1/3": "<type>eighth</type>"  # 1/3 1/5 1/7 all 8th notes so one beat will beam together
  "1/4": "<type>16th</type>"
  "1/8": "<type>32nd</type>"
  "1/9":"<type>eighth</type>"
  "1/11":"<type>eighth</type>"
  "1/13":"<type>eighth</type>"
  "1/5": "<type>16th</type>"
  "2/5":"<type>eighth</type>"
  "3/5":"<type>eighth</type><dot/>" #TODO should be tied
  "4/5":"<type>quarter</type>" #TODO should be tied
  "1/7": "<type>thirtysecond</type>" # ??? correct???hhhhhhhhhh
  "2/7": "<type>16th</type>" # ??? correct???hhhhhhhhhh
  "3/7": "<type>16th</type><dot/>" # ??? correct???hhhhhhhhhh
  "4/7": "<type>eighth</type>" # ??? correct???hhhhhhhhhh
  "5/7": "<type>eighth</type><dot/><dot/>" # ??? correct???hhhhhhhhhh
  "2/8": "<type>16th</type>"
  "3/8": "<type>16th</type><dot/>"  # 1/4 + 1/8
  "5/8": "<type>eighth</type>"   # TODO: WRONG
  "4/8": "<type>eighth</type>"
  "7/8": "<type>eighth</type><dot/><dot/>" # 1/2 + 1/4 + 1/8
  "1/6": "<type>16th</type>"
  "2/6": "<type>eighth</type>"
  "3/6": "<type>quarter</type>" # not sure??
  "4/6":"<type>quarter</type>" # NOT SURE ????
  "5/6":"<type>eighth</type><dot/><dot/>" #  WRONGnot sure TODO??
  "1/4":"<type>16th</type>"
  "2/4":"<type>eighth</type>"
  "3/4":"<type>eighth</type><dot/>"
  "3/8":"<type>16th</type><dot/>"


to_musicxml= (composition) ->
  # convert composition(a json type object) to musicxml
  context=
    in_slur:false
    slur_number:0
    measure_number:1
  ary=[]
  for line in composition.lines
    for item in root.all_items(line)
      if item.my_type is "measure"
        ary.push draw_measure(item,context)
        context.measure_number++

  composer = root.get_composition_attribute(composition,"Author")
  time = root.get_time(composition)
  params=
    body:ary.join(" ")
    movement_title:root.get_title(composition)
    title:root.get_title(composition)
    composer:""  # TODO
    poet:""
    beats:musicxml_beats(composition)
    encoding_date:""
    fifths:musicxml_fifths(composition)
    mode_directive:mode_directive(composition)
    mode: composition.mode
    transpose:musicxml_transpose(composition)
  templates.composition(params)

note_template_str='''
            {{before_ornaments}}
            {{chord}}
            <note>
              <pitch>
                <step>{{step}}</step>
                {{alter}}
                <octave>{{octave}}</octave>
              </pitch>
              <duration>{{duration}}</duration>
              {{tie}}
              <voice>1</voice>
              {{type_and_dots}}
              {{lyric}}
              <notations>{{tied}}
              {{end_slur}}{{begin_slur}}</notations>
             </note>
             {{after_ornaments}}
'''
templates.note = root._.template(note_template_str)

barline_template_str='''
            <barline location="{{location}}">
                <bar-style>{{bar_style}}</bar-style>
            </barline>

'''
templates.barline = root._.template(barline_template_str)

musicxml_beats= (composition) ->
  time_signature=composition.time_signature
  console.log 
  return 4 if !time_signature
  return 4 if time_signature is ""
  result = /^([0-9]+)\//.exec(time_signature)
  return 4 if !result?
  return result[1]

draw_note = (pitch,context) ->
  if pitch.my_type is "dash"
    return "" if !pitch.pitch_to_use_for_tie?
  [before_ornaments,after_ornaments]=draw_ornaments(pitch,context)
  if pitch.dash_to_tie? and pitch.dash_to_tie is true
    # TODO: have parser do this!
    pitch.normalized_pitch=pitch.pitch_to_use_for_tie.normalized_pitch
    pitch.octave=pitch.pitch_to_use_for_tie.octave
  if pitch.my_type is "dash"
    return if pitch.dash_to_tie? and pitch.dash_to_tie is false
  fraction=new Fraction(pitch.numerator,pitch.denominator)

  divisions_per_quarter=24
  frac2=fraction.multiply(divisions_per_quarter)
  duration=frac2.numerator
  if pitch.denominator not in [0,1,2,4,8,16,32,64,128] 
     x=2 # eighth note
     if pitch.denominator is 6
       x=4 # 16th
     if  pitch.denominator is 5
       x=4
     duration=divisions_per_quarter/x
  if pitch.fraction_array?
    f=pitch.fraction_array[0]
  else
    f=pitch
  type_and_dots= musicxml_type_and_dots(f.numerator,f.denominator)
  tie=""
  tied=""
  if pitch.tied?
    tie="""
    <tie type="start"/>
    """
    tied="""
    <tied type="start"/>
    """
  if pitch.my_type is "dash" and pitch.dash_to_tie is true
    tied2="""
    <tied type="stop"/>
    """
    tied=tied2+tied  # TODO:review
  begin_slur = end_slur =""
  if item_has_attribute(pitch,"end_slur")
    end_slur="""
<slur number="#{context.slur_number}" type="stop"/>
    """
    context.in_slur=false

  if item_has_attribute(pitch,"begin_slur") 
    begin_slur="""
<slur number="#{++context.slur_number}" type="start"/>
    """
    context.in_slur=true
  params=
    step: musicxml_step(pitch)
    octave:musicxml_octave(pitch)
    duration:duration
    alter:musicxml_alter(pitch)
    type_and_dots:type_and_dots
    tied:tied
    tie:tie
    lyric:musicxml_lyric(pitch)
    begin_slur:begin_slur
    end_slur:end_slur
    before_ornaments:before_ornaments
    after_ornaments:after_ornaments
    chord:music_xml_chord(pitch)
  templates.note(params)

music_xml_chord = (pitch) ->
  chord=get_item_attribute(pitch,"chord_symbol")
  return "" if !chord? or (chord is "")
  templates.chord({chord:chord.source})

musicxml_lyric = (pitch,context) ->
  return "" if !pitch.syllable? or pitch.syllable is ""
  """
  <lyric number="1">
     <text>#{pitch.syllable}</text>
  </lyric>
  """

musicxml_type_and_dots= (numerator,denominator) ->
  if numerator is denominator
    return "<type>quarter</type>"
  frac="#{numerator}/#{denominator}"
  looked_up_duration=fraction_to_musicxml_type_and_dots[frac]
  if !looked_up_duration?
    alternate= "<type>16th</type>"
    return alternate # return something
  looked_up_duration

mode_directive = (composition) ->
  return "" if composition.mode is "major"
  return templates.mode_directive({words:composition.mode})


directive_for_chord_template_str="""
            <direction placement="above">
                <direction-type>
		<words default-x="-1" default-y="15" font-size="medium" font-weight="normal">{{chord}}</words>
                </direction-type>
            </direction>
"""
templates.chord = root._.template(directive_for_chord_template_str)

directive_template_str = """
			<direction placement="above">
				<direction-type>
					<words default-x="-1" default-y="15" font-size="medium" font-weight="normal">{{words}} 
					</words>
				</direction-type>
			</direction>
"""
templates.directive = root._.template(directive_template_str)

transpose_template_str = """
        <transpose>
          <diatonic>{{diatonic}}</diatonic>
          <chromatic>{{chromatic}}</chromatic>
        </transpose>
"""
templates.transpose = root._.template(transpose_template_str)

mode_directive_template_str = """
			<direction placement="above">
				<direction-type>
					<words default-x="-1" default-y="15" font-size="medium" font-weight="normal">{{words}} 
					</words>
				</direction-type>
			</direction>
"""
templates.mode_directive = root._.template(mode_directive_template_str)

display_mode= (composition) ->

grace_note_template_str =  """
      <note>
        <grace {{steal_time}} />
        <pitch>
          <step>{{step}}</step>
                {{alter}}
          <octave>{{octave}}</octave>
        </pitch>
        <voice>1</voice>
        <type>{{type}}</type>
      </note>
  """

templates.grace_note = root._.template(grace_note_template_str)

grace_note_after_template_str =  """
        <grace steal-time-previous="{{steal_time_percentage}}"/>
        <pitch>
          <step>{{step}}</step>
                {{alter}}
          <octave>{{octave}}</octave>
        </pitch>
        <voice>1</voice>
        <type>{{type}}</type>
      </note>
"""

templates.grace_note_after = root._.template(grace_note_after_template_str)

draw_grace_note = (ornament_item,which,len,steal_time="",placement,context) ->
  params=
    step:musicxml_step(ornament_item)
    alter:musicxml_alter(ornament_item)
    octave:musicxml_octave(ornament_item)
    type:"<span>32nd</span>"
    steal_time:steal_time
  templates.grace_note(params)

musicxml_fifths = (composition) ->
  mode=composition.mode
  return 0 if !mode
  return 0 if mode is ""
  hash=
    lydian: 1
    major: 0
    mixolydian:-1
    dorian:-2
    minor:-3
    aolian:-3
    phrygian:-4
    locrian:-5
  result=hash[mode]
  if !result
    return 0
  result

draw_ornaments = (pitch,context) ->
  before_ary=[]
  ornament=root.get_ornament(pitch)
  return ['',''] if !ornament
  return "" if ornament.placement is "after" # currently not supported
  if ornament.placement is "before"
    len=ornament.ornament_items.length
    steal_time=""
    before_ary=(draw_grace_note(x,ctr,len,steal_time,ornament.placement,context) for x,ctr in ornament.ornament_items)
    return [before_ary.join("/n"),""]
  if ornament.placement is "after"
    len=ornament.ornament_items.length
    num=50/len
    steal_time="""
      steal-time-previous="#{num}"
    """
    after_ary=(draw_grace_note(x,ctr,len,steal_time,ornament.placement,context) for x,ctr in ornament.ornament_items)
    return ["",after_ary.join('')]
  ["",""]

musicxml_transpose = (composition) ->

  return "" if composition.key is "C"
  # arry is [diatonic,chromatic]
  lookup =
    "Db": [1,1]
    "C#": [0,1]
    "D":[1,2]
    "Eb":[2,3]
    "E":[2,4]
    "F":[3,5]
    "F#":[3,6]
    "G":[4,7]
    "G#":[4,8]
    "Ab":[5,8]
    "A":[5,9]
    "Bb":[6,10]
    "A#":[5,10]
    "B":[6,11]
  
  [diatonic,chromatic]=  lookup[composition.key] or  [0,0]
  return "" if diatonic is 0
  templates.transpose({diatonic:1,chromatic:2})
  
musicxml_step = (pitch) ->
  return "" if !pitch
  return "" if !pitch.normalized_pitch?
  pitch.normalized_pitch[0]

musicxml_alter = (pitch) ->
  alt=""
  if pitch.normalized_pitch.indexOf('#') > -1
    alt="1"
  else if pitch.normalized_pitch.indexOf('b') > -1
    alt="-1"
  else
    return ""
  "<alter>#{alt}</alter>"

    

musicxml_octave = (pitch) ->
  pitch.octave + 4


barline_type_to_musicxml_barline_style_hash=
  left_repeat:"" 

musicxml_barline = (barline,location="right",context) ->
  if barline.my_type is "left_repeat"
    return """
    <barline location="#{location}">
       <repeat direction="forward" times="2"/>
    </barline>
    """
  if barline.my_type is "right_repeat"
    return """
    <barline location="#{location}">
       <repeat direction="backward" times="2"/>
    </barline>
    """
  if barline.my_type is "double_barline"  
     # || in DoremiScript, should print out as a heavy barline
     # note that MusicScore doesn't support heavy-heavy !!
    return """ 
    <barline location="#{location}">
    <bar-style>light-light</bar-style>
    </barline>
    """
  # TODO: review-
  # Don't output anything for regular barline ??
  return ""
  #templates.barline({location:location,bar_style:""})

draw_barline = (barline,location,context) ->
  musicxml_barline(barline,location,context)

draw_measure= (measure,context) ->
  ary=[]
  for item,ctr in root.all_items(measure)
    if item.is_barline
      barline_location= if ctr is 0 then "left" else "right"
      ary.push(draw_barline(item,barline_location,context)) 
    ary.push(draw_note(item,context)) if item.my_type is "pitch"
    ary.push(draw_note(item,context)) if item.my_type is "dash"
  measure="""
  <measure number="#{context.measure_number}">
  """
  measure="" if context.measure_number is 1 
  """
    #{measure}
    #{ary.join(' ')}
</measure>
  """

to_musicxml.templates=templates

root.to_musicxml=to_musicxml


composition_template_str = '''
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 2.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="2.0">
    <work>
        <work-number></work-number>
        <work-title></work-title>
    </work>
    <movement-number></movement-number>
    <movement-title>{{movement_title}}</movement-title>
    <identification>
            <creator type="composer">{{composer}}</creator>
            <creator type="poet">{{poet}}</creator>
        <rights></rights>
        <encoding>
            <software>DoremiScript</software>
            <encoding-date>{{encoding_date}}</encoding-date>
            <software>DoremiScript</software>
        </encoding>
        <source></source>
    </identification>
    <defaults>
        <scaling>
            <millimeters>7.056</millimeters>
            <tenths>40</tenths>
        </scaling>
        <page-layout>
            <page-height>1683.67</page-height>
            <page-width>1190.48</page-width>
            <page-margins type="both">
                <left-margin>56.6893</left-margin>
                <right-margin>56.6893</right-margin>
                <top-margin>56.6893</top-margin>
                <bottom-margin>113.379</bottom-margin>
            </page-margins>
        </page-layout>
    </defaults>
    <credit page="1">
            <credit-words font-size="24" default-y="1626.98" default-x="595.238" justify="center" valign="top">{{title}}</credit-words>
    </credit>
    <part-list>
        <score-part id="P1">
            <part-name></part-name>
            <score-instrument id="P1-I3">
                <instrument-name></instrument-name>
            </score-instrument>
            <midi-instrument id="P1-I3">
                <midi-channel>1</midi-channel>
                <midi-program>1</midi-program>
            </midi-instrument>
        </score-part>
    </part-list>
    <part id="P1">
        <measure number="0" implicit="yes">
            <print>
                <system-layout>
                    <system-margins>
                        <left-margin>-0.00</left-margin>
                        <right-margin>0.00</right-margin>
                    </system-margins>
                    <top-system-distance>252.10</top-system-distance>
                </system-layout>
            </print>
            <attributes>
                <divisions>24</divisions>
                <key>
                    <fifths>{{fifths}}</fifths>
                    <mode>{{mode}}</mode>
                </key>
                <time>
                        <beats>{{beats}}</beats>
                        <beat-type>4</beat-type>
                </time>
                <clef>
                    <sign>G</sign>
                    <line>2</line>
                </clef>
                {{transpose}}
            </attributes>
            {{mode_directive}}
            {{body}}
    </part>
</score-partwise>

'''
templates.composition = root._.template(composition_template_str)

