$.fn.hold = function (callback, interval) {
  var timeoutId = 0;
  this.on("touchstart", function () {
    timeoutId = setTimeout(callback, interval);
  });
  this.on("touchend", function() {
    clearTimeout(timeoutId);
  });
}
