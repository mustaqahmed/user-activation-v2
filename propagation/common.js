var frameLabel;
var popupIntervalId;

function $(id) {
  return document.getElementById(id);
}

function log(msg, color) {
  var styleStr = "background-color:" + color;
  var fullMsg = frameLabel + "." + msg;

  var timeStr = new Date().toTimeString().split(" ", 1)[0];
  timeStr = timeStr.substring(timeStr.indexOf(":"));

  $("log").innerHTML += "<span class='log-entry' style='" + styleStr + "'>"
      + fullMsg + " " + timeStr + "</span>";
}

function clearPopupInterval() {
  if (popupIntervalId) {
    window.clearInterval(popupIntervalId);
    popupIntervalId = undefined;
  }
}

function setPopupInterval() {
  const intervalMs = 5000;
  clearPopupInterval();
  popupIntervalId = window.setInterval(callWindowOpen, intervalMs);
}

function callWindowOpen() {
  var link = "http://www.example.com?opener=" + frameLabel;
  var result = window.open(link);
  log("popup", result? "lightgreen" : "lightpink");
}

function commonInit(label) {
  frameLabel = label;
  $("frame-label").innerHTML += " " + label;

  log("load", "beige");

  $("try-checkbox").addEventListener("change", e => {
    if (e.target.checked)
      setPopupInterval();
    else
      clearPopupInterval();
  });

  document.body.addEventListener("click", e => {
    log("click", "yellow");
  });
}
