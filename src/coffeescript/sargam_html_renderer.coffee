root = exports ? this
root.SargamHtmlRenderer = class SargamHtmlRenderer
  
  # Class variable.
  LOOKUP:
    "b"    : "&#9837;" # flat  sign
    "#"    : "&#9839;" # sharp sign
    "."    : "&bull;"
    "*"    : "&bull;"
    "|:"  : "&#x1d106"
  #  "~"    : "&#x1d197" # mordent
  # U+1D19D for the half Pralltriller, and adding U+1D1A0
   # "~"   : "&#x1D19D&#x1D1A0" #mordent
    "~"   : "&#x1D19D&#x1D19D" #mordent
    ":|"  : "&#x1d107"
    "|"  : "&#x1d100"
    "||"  : "&#x1d101" #double barline
    "%"  : "&#x1d10E"
    "|]"  : "&#x1d102" # final barline
    "[|"  : "&#x1d103" # reverse final barline


  adjust_slurs_in_dom: () ->
    # TODO: extract into own file?
    $('span[data-begin-slur-id]').each  (index) ->
      pos2=$(this).offset()
      attr=$(this).attr("data-begin-slur-id")
      slur=$("##{attr}")
      return if slur.length==0
      pos1=$(slur).offset()
      $(slur).css {width: pos2.left- pos1.left + $(this).width()}

  draw_logical_line: (logical_line) ->
    # need to use => for scoping to work
    x=(for item in logical_line.sargam_line.items
                      do (item) => this.draw_item(item)).join('')
    "<div class='stave sargam_line'>#{x}</div>"

  draw_measure: (measure) ->
    x=(for item in measure.items
      do (item) =>
        return "??" if !item.my_type
        val= this.draw_item(item))
    x.join ""

  draw_item: (item) ->
    #window.debug=false
    return this.draw_beat(item) if item.my_type=="beat"
    return this.draw_measure(item) if item.my_type=="measure"
    return "" if item.my_type =="begin_slur" or item.my_type=="end_slur" or item.my_type =="begin_beat" or item.my_type=="end_beat"
    my_source = SargamHtmlRenderer::LOOKUP[item.source]
    my_source=item.source if !my_source?
    my_source=(Array(item.source.length+1).join "&nbsp;") if item.my_type=="whitespace"
    pitch_sign="" # flat,sharp,etc
    if item.my_type is 'pitch'
      my_source=item.pitch_source 
      # TODO: make less hackish
      if (my_source[1] is "#")
        my_source=my_source[0]
        pitch_sign="<span class='pitch_sign sharp'>#{SargamHtmlRenderer::LOOKUP['#']}</span>"
      if (my_source[1] is "b")
        my_source=my_source[0]
        pitch_sign="<span class='pitch_sign flat'>#{SargamHtmlRenderer::LOOKUP['b']}</span>"
    bull=SargamHtmlRenderer::LOOKUP["."]
    upper_sym=""
    lower_sym=""
    lower_sym=bull if  item.octave == -1
    lower_sym=":" if  item.octave == -2
    upper_sym=":" if  item.octave == 2
    upper_sym=bull if  item.octave == 1
    lower_sym_html=""
    if lower_sym isnt ""
       lower_sym_html="""
    <span class="lower_octave1">#{lower_sym}</span>
       """


    upper_sym_html=""
    if upper_sym isnt ""
       upper_sym_html="""
       <span class="upper_octave1 upper_octave_indicator">#{upper_sym}</span>
       """
    syl= ""
    upper_attributes_html=""
    syl= item.syllable if item.syllable?
    syl_html=""
    if syl isnt ""
       syl_html="""
       <span class="syllable1">#{syl}</span>
       """
    data1=""
    if item.attributes
      upper_attributes_html=(for attribute in item.attributes
        do (attribute) =>
          return "" if attribute.my_type=="upper_octave_indicator"
          if (attribute.my_type=="begin_slur")
            @id_ctr++
            @last_slur_id=@id_ctr
            return """
            <span id="#{@id_ctr}" class="slur">&nbsp;&nbsp;</span>
            """
          if (attribute.my_type=="end_slur")
            data1="data-begin-slur-id='#{@last_slur_id}'"
            return ""
          my_item=attribute
          my_source2 = SargamHtmlRenderer::LOOKUP[my_item.source]
          my_source2=my_item.source if !my_source2
          """
          <span class="upper_attribute #{my_item.my_type}">#{my_source2}</span>
          """).join('')
    # TODO: make more elegant by not including empty tags
    # hacked here
    """
    <span class="note_wrapper" #{data1}>#{upper_attributes_html}#{upper_sym_html}#{lower_sym_html}#{syl_html}<span class="note #{item.my_type}" tabindex="0">#{my_source}</span>#{pitch_sign}</span>
    """

  draw_beat: (beat) ->
    x='beat here'
    x=(for item in beat.items
      do (item) =>
        return "??" if !item.my_type
        val= this.draw_item(item))
        extra=""
        extra= "data-subdivisions=#{beat.subdivisions}" if beat.subdivisions > 1
        """
    <span #{extra} class='beat'>#{x.join('')}</span>
        """
        
  to_html: (composition_data) ->
    window.debug=false
    @id_ctr=new Date().getTime();
    attrs=''
    attrs=(for attribute in composition_data.attributes.items
        """
        <div class="attribute"><span class="attribute_key">#{attribute.key}
        </span>:<span class="attribute_value">#{attribute.value}
        </span></div>
        """
        ) .join('\n') if composition_data.attributes?
    attrs="<div class='attribute_section'>#{attrs}</div>"

    x=(for logical_line in composition_data.logical_lines
      do (logical_line) =>
        this.draw_logical_line(logical_line)).join('\n')
    "<div class='composition_data'>#{attrs}#{x}</div>"


