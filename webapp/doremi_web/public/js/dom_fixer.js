(function() {
  var adjust_slurs_in_dom, root;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  adjust_slurs_in_dom = function() {
    var $next, $note, $par, $syllable, existing_margin_right, extra, index, left, len, margin_right, next_left, syl_right, syllable, syllables, tag, width, x, _len;
    syllables = $('span.syllable').get();
    len = syllables.length;
    for (index = 0, _len = syllables.length; index < _len; index++) {
      syllable = syllables[index];
      if (index === (len - 1)) {
        continue;
      }
      $syllable = $(syllable);
      $next = $(syllables[index + 1]);
      width = $syllable.offset().width;
      left = $next.offset().left;
      if ($next.offset().top !== $syllable.offset().top) {
        continue;
      }
      next_left = $next.offset().left;
      syl_right = $syllable.offset().left + width;
      if (syl_right > next_left) {
        console.log("correcting syllable " + ($syllable.html()));
        $par = $syllable.parent();
        $note = $('span.note', $par);
        margin_right = $note.css("margin-right");
        existing_margin_right = 0;
        extra = 5;
        $note.css("margin-right", "" + (existing_margin_right + (syl_right - next_left) + extra) + "px");
      }
    }
    console.log("adjust_slurs_in_dom");
    if (!(window.left_repeat_width != null)) {
      x = $('#testing_utf_support');
      x.show();
      window.left_repeat_width = $(x).width();
      if (!(window.left_repeat_width != null)) {
        window.left_repeat_width = 0;
      }
      x.hide();
      $('body').append("left_repeat_width is " + window.left_repeat_width);
    }
    if ((window.left_repeat_width === 0) || (window.left_repeat_width > 10)) {
      tag = "data-fallback-if-no-utf8-chars";
      $("span[" + tag + "]").each(function(index) {
        var attr, obj;
        obj = $(this);
        attr = obj.attr(tag);
        return obj.html(attr);
      });
    }
    $('span[data-begin-slur-id]').each(function(index) {
      var attr, pos1, pos2, slur, val;
      pos2 = $(this).offset();
      attr = $(this).attr("data-begin-slur-id");
      slur = $("#" + attr);
      if (slur.length === 0) {
        return;
      }
      pos1 = $(slur).offset();
      val = pos2.left - pos1.left;
      if (val < 0) {
        _.error("adjust_slurs_in_dom, negative width");
        return;
      }
      return $(slur).css({
        width: pos2.left - pos1.left + $(this).width()
      });
    });
    return $('span.ornament.placement_before').each(function(index) {
      var el;
      el = $(this);
      return el.css('margin-left', "-" + (el.offset().width) + "px");
    });
  };
  root.adjust_slurs_in_dom = adjust_slurs_in_dom;
}).call(this);
