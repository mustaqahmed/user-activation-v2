function $(id) {
  return document.getElementById(id);
}

function log(msg, color) {
  var styleStr = "color:" + color;
  $("log").innerHTML += "<span class='log-entry' style='" + styleStr + "'>"
      + msg + "</span>";
}
