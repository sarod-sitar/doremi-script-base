(function() {
  var adjust_slurs_in_dom, root;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  adjust_slurs_in_dom = function() {
    console.log("entering adjust_slurs_in_dom");
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
      _.debug("fixing ornaments.processing " + this);
      el = $(this);
      return el.css('margin-left', "-" + (el.offset().width) + "px");
    });
  };
  root.adjust_slurs_in_dom = adjust_slurs_in_dom;
}).call(this);
