#  $ = jQuery
#
# functions follow:
root = exports ? this

$(document).ready ->
  if document.cookie? and document.cookie.indexOf('user') > -1
    $('#sign_in').hide() 
  #####################
  # Functions
  ####################

  redirect_helper = (fname) ->
    loc=document.location
    document.location="#{loc.protocol}//#{loc.host}#{fname}"
  console.log("redirect_helper" , redirect_helper)
  window.timed_count = () =>
    cur_val= $('#entry_area').val()
    if window.last_val != cur_val
      $('#run_parser').trigger('click')
      window.last_val= cur_val
    t=setTimeout("timed_count()",1000)
  
  window.do_timer  =  () =>
    if !window.timer_is_on
      window.timer_is_on=1
      window.timed_count()
  
  run_parser = () ->
    return if parser.is_parsing
    window.parse_errors=""
    $('#parse_tree').text('parsing...')
    try
      parser.is_parsing=true
      $('#warnings_div').hide()
      $('#warnings_div').html("")
      src= $('#entry_area').val()
      composition_data= parser.parse(src)
      composition_data.source=src
      # TODO: not really necessary on every keystroke!!
      # TODO: think when to run these.
      composition_data.lilypond=to_lilypond(composition_data)
      composition_data.musicxml=to_musicxml(composition_data)
      window.the_composition=composition_data
      $('#parse_tree').text("Parsing completed with no errors \n"+JSON.stringify(composition_data,null,"  "))
      if composition_data.warnings.length > 0
        $('#warnings_div').html "The following warnings were reported:<br/>"+composition_data.warnings.join('<br/>')
        $('#warnings_div').show()
      $('#parse_tree').hide()
      $('#rendered_doremi_script').html(to_html(composition_data))
      $('#lilypond_source').text(composition_data.lilypond)
      $('#musicxml_source').text(composition_data.musicxml)
      # TODO: combine with the above line..
      dom_fixes()
      canvas = $("#rendered_in_staff_notation")[0]
    catch err
      #console.log "err parsing, err is",err
      window.parse_errors= window.parse_errors + "\n"+ err
      $('#parse_tree').text(window.parse_errors)
      $('#parse_tree').show()
    finally
      window.last_val=$('#entry_area').val()
      parser.is_parsing=false

  get_current_line_of_text_area = (obj) ->
    get_current_line_of(obj.value,obj.selectionStart,obj.selectionEnd)

  get_current_line_of = (val,sel_start,sel_end) ->
    # doesn't use dom
    # extract current line from some text given start and
    # end positions representing current section
    to_left_of_cursor=val.slice(0,sel_start)
    to_right_of_cursor=val.slice(sel_end)
    pos_of_start_of_line=to_left_of_cursor.lastIndexOf('\n')
    if pos_of_start_of_line is -1
      start_of_line_to_end=val
    else
      start_of_line_to_end=val.slice(pos_of_start_of_line+1)
    index_of_end_of_line=start_of_line_to_end.indexOf('\n')
    if index_of_end_of_line is -1
      line=start_of_line_to_end
    else
      line=start_of_line_to_end.slice(0,index_of_end_of_line)
    line
  
  handle_key_stroke = (event) ->
    # The purpose of this code is to filter the characters as the
    # user types to make it easier to enter notes. For example, if the
    # user is entering the main line of sargam, then it is nice to automatically convert a "s" or "p" that the user types into uppercase "S" or "P".
    # For now use a primitive test to see if the user is "in" a sargam line.
    # In the future, can add feature to constrain to notes in mode or a "NotesUsed" attribute
    el=this
    val=el.value
    sel_start=el.selectionStart
    sel_end=el.selectionEnd
    to_left_of_cursor=val.slice(0,sel_start)
    to_right_of_cursor=val.slice(sel_end)
    pos_of_start_of_line=to_left_of_cursor.lastIndexOf('\n')
    if pos_of_start_of_line is -1
      start_of_line_to_end=val
    else
      start_of_line_to_end=val.slice(pos_of_start_of_line+1)
    index_of_end_of_line=start_of_line_to_end.indexOf('\n')
    if index_of_end_of_line is -1
      line=start_of_line_to_end
    else
      line=start_of_line_to_end.slice(0,index_of_end_of_line)
    line=get_current_line_of_text_area(el)
    if event.which in [115,112]
       if (line.indexOf('|') > -1)
         hash=
           112:"P"
           115:"S"
         char=hash[event.which]
         event.preventDefault()
         el.value="#{to_left_of_cursor}#{char}#{to_right_of_cursor}"
         #window.last_val=el.value
         el.setSelectionRange(sel_start+1,sel_start+1)
         el.focus()
         #$('#run_parser').click
  get_dom_fixer = () ->
    params=
      type:'GET'
      url:'/js/dom_fixer.js'
      dataType:'text'
      success: (data) ->
        $('#dom_fixer_for_html_doc').html(data)
        window.generate_html_doc_ctr--
    $.ajax(params)
  
  get_zepto = () ->
    params=
      type:'GET'
      url:'/js/third_party/zepto.unminified.js'
      dataType:'text'
      success: (data) ->
        $('#zepto_for_html_doc').html(data)
        window.generate_html_doc_ctr--
    $.ajax(params)
   
  get_css = () ->
    params=
      type:'GET'
      url:'/css/doremi.css'
      dataType:'text'
      success: (data) ->
        $('#css_for_html_doc').html(data)
        window.generate_html_doc_ctr--
    $.ajax(params)
  console.log("get_css is",get_css) 
  setup_samples_dropdown= () ->
    params=
      type:'GET'
      url:'/list_samples'
      dataType:'json'
      success: (data) ->
        str= "<option value='#{item}'>#{item}</option>" 
        str=(for item in data
          short=item.slice(item.lastIndexOf('/')+1)
          "<option value='#{item}'>#{short}</option>").join('')
        $('#sample_compositions').append(str)
    $.ajax(params)
  
  
  setup_links= (filename) ->
    console.log "setup_links"
    without_suffix=filename.substr(0, filename.lastIndexOf('.txt')) || filename
    for typ in ["jpeg","pdf","mid","ly","txt","xml","html"]
      snip = """
      window.open('#{without_suffix}.#{typ}'); return false; 
      """
      $("#download_#{typ}").attr('href',full_path="#{without_suffix}.#{typ}")
      if typ is 'jpeg'
        $('#lilypond_jpeg').attr('src',full_path)
      $("#download_#{typ}").attr('onclick',snip)
  
  setup_links_after_save= (filename) ->
    without_suffix=filename.substr(0, filename.lastIndexOf('.txt')) || filename
    $('#url_to_reopen').val(x=window.location.href)
    $('#reopen_link').text(x)
    $('#reopen_link').attr('href',x)
    for typ in ["ly","txt","xml"]
      snip = """
      window.open('#{without_suffix}.#{typ}'); return false; 
      """
      $("#download_#{typ}").attr('href',full_path="#{without_suffix}.#{typ}")
      $("#download_#{typ}").attr('onclick',snip)
  
  load_filepath= (filepath) ->
    # Gets called if url is like http://ragapedia.com/compositions/yesterday
    params=
      type:'GET'
      url:"#{filepath}.txt"
      dataType:'text'
      success: (data) =>
        console.log "load_filepath"
        $('#entry_area').val(data)
        $('#entry_area').trigger('change') # causes auto-resize
        $('#sample_compositions').val("Load sample compositions")
        setup_links_after_save(filepath)
        setup_links(filepath)
        $('.generated_by_lilypond').show()
        run_parser()
    $.ajax(params)

  save_to_server = (save_to_samples=false)  ->
    my_data =
      doremi_script_source: $('#entry_area').val()
      lilypond: to_lilypond(window.the_composition)
      musicxml:to_musicxml(window.the_composition)
      html_page: generate_html_page_aux(window.the_composition)
      fname:window.the_composition.filename
      save_to_samples: save_to_samples
    obj=
      type:'POST'
      url:'/save'
      dataType: "json"
      data: my_data
      error: (some_data) ->
        alert "Saving to server failed"
      success: (some_data,text_status) ->
        redirect_helper(some_data.fname)
    $.ajax(obj)

  # Handler for samples dropdown
  sample_compositions_click = ->
    return if this.selectedIndex is 0
    redirect_helper(this.value)
  
  handleFileSelect = (evt) =>
    # Handler for file upload button(HTML5)
    file = document.getElementById('file').files[0]
    reader=new FileReader()
    reader.onload =  (evt) ->
      $('#entry_area').val evt.target.result
      $('#lilypond_jpeg').attr('src',"")
      $('#open_div').hide()
    reader.readAsText(file, "")

  ########################
  #
  # Code starts here
  #
  #######################
  console.log("code starts here")
  ###
  $("#menubar").superfish(pathClass : 'current'
                          animation : { height:"show" }
                          onBeforeShow : () -> $(this).hide()
                          onHide : ()-> $(this).show())
  ###
  $('#entry_area').autogrow()
  parser=DoremiScriptParser
  parser.is_parsing=false
  window.parse_errors=""

  window.generate_html_doc_ctr=3
  get_css()
  get_zepto()
  get_dom_fixer()
  $('.generated_by_lilypond').hide()
  Logger=_console.constructor
  # _console.level  = Logger.DEBUG
  _console.level  = Logger.WARN
  _.mixin(_console.toObject())
  if Zepto?
    _.debug("***Using zepto.js instead of jQuery***")
  debug=false
  setup_samples_dropdown()
  if window.location.host.indexOf('localhost') is -1
   $("#add_to_samples").hide()

  $('#sample_compositions').change(sample_compositions_click)


  document.getElementById('file').addEventListener('change', handleFileSelect, false)
  window.timer_is_on=0
  # "/samples/happy_birthday" in URL
  if window.location.pathname.indexOf("/samples/") > -1
    load_filepath window.location.pathname
  if window.location.pathname.indexOf("/compositions/") > -1
    load_filepath window.location.pathname
  str=""
  $('#entry_area').val(str)
  parser=DoremiScriptParser
  parser.is_parsing=false
  window.parse_errors=""
  $('#show_parse_tree').click ->
      $('#parse_tree').toggle()
  $('a#show_open').click ->
      $('#open_div').show()
      $('#file').focus()
  $('#save_to_server').click =>
    save_to_server()
          #composition_data.lilypond=to_lilypond(composition_data)
          #composition_data.musicxml=to_musicxml(composition_data)


  $('#generate_staff_notation').click =>
    $('#lilypond_jpeg').attr('src',"")
    $('.generated_by_lilypond').hide()
    my_data =
      as_html:true
      fname:window.the_composition.filename
      lilypond: window.the_composition.lilypond
      doremi_script_source: $('#entry_area').val()
      musicxml:window.the_composition.musicxml
      save_to_samples: false
    obj=
      type:'POST'
      url:'/lilypond.txt'
      dataType: "json"
      data: my_data
      error: (some_data) ->
        alert "Generating staff notation failed"
        $('#lilypond_jpeg').attr('src','none.jpg')
      success: (some_data,text_status) ->
        redirect_helper(some_data.fname)
    $.ajax(obj)

  generate_html_page_aux = () ->
    console.log "generate_html_page_aux"
    return if window.generate_html_doc_ctr > 0
    css=$('#css_for_html_doc').html()
    js=$('#zepto_for_html_doc').html()
    js2=$('#dom_fixer_for_html_doc').html()
    composition=window.the_composition
    full_url="http://ragapedia.com"
    to_html_doc(composition,full_url,css,js+js2)

  $('#generate_html_page').click =>
    generate_html_page_aux()

  $('#show_lilypond_output').click ->
    $('#lilypond_output').toggle()
  $('#show_musicxml_source').click ->
    $('#musicxml_source').toggle()

  $('#show_lilypond_source').click ->
    $('#lilypond_source').toggle()
  $('#save_to_samples').click ->
    save_to_server(true)
  $('#run_parser').click ->
      run_parser()
  $('#entry_area').keypress(handle_key_stroke)

  $('#parse_tree').hide()
  $('#lilypond_output').hide()
  $('#lilypond_source').hide()
  $('#musicxml_source').hide()
  window.do_timer()
  run_parser if $('#entry_area').val() isnt ""

