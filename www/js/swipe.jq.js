$.fn.swipeable = function() {
  var x;
  var parent = this;

  console.log(this.find('.item'), "making swipeable");
  this.addClass("swipeable");

  this.find('.item')
      .on('touchstart', function(e) {
          console.log("touchstart");
          console.log(e.originalEvent.pageX);
          parent.find('.item.open').css('left', '0px').removeClass('open'); // close em all
          $(e.currentTarget).addClass('open');
          x = e.originalEvent.targetTouches[0].pageX; // anchor point
      })
      .on('touchmove', function(e) {
          console.log("touchmove");
          var change = e.originalEvent.targetTouches[0].pageX - x;
          change = Math.min(Math.max(-100, change), 100); // restrict to -100px left, 0px right
          e.currentTarget.style.left = change + 'px';
          if (change < -10) {
              $(document).on('touchmove', function(e) {
                  e.preventDefault();
              });
          }
      })
      .on('touchend', function(e) {
          console.log("touchend");
          var left = parseInt(e.currentTarget.style.left);
          var new_left;
          if (left < -70) {
              new_left = '-100px';
          } else if (left > 70) {
              new_left = '100px';
          } else {
              new_left = '0px';
          }
          // e.currentTarget.style.left = new_left
          $(e.currentTarget).animate({left: new_left}, 200);
          $(document).unbind('touchmove', function(e) {
              e.preventDefault();
          });
      });
  return this;
};
