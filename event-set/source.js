const groupPrefix = "#group ";

let eventList = [
  "#group mouse events",
  "auxclick",
  "click",
  "contextmenu",
  "dblclick",
  "mousedown",
  "mousemove",
  "mouseup",

  "#group pointer events",
  "pointerdown",
  "pointermove",
  "pointerup",

  "#group touch events",
  "touchend",
  "touchmove",
  "touchstart",

  "#group keyboard events",
  "keydown",
  "keypress",
  "keyup",

  "#group other events",
  "change",
  "compositionend",
  "compositionstart",
  "compositionupdate",
  "input",
  "reset",
  "submit",
];

function $(id) {
    return document.getElementById(id);
}

function log(msg) {
  $("log").innerHTML += (msg + "<br> ");
}

function populateEventOptions() {
  let optGroupElem = undefined;

  eventList.forEach(function(eventName) {
    if (eventName.startsWith(groupPrefix)) {
      optGroupElem = document.createElement("optgroup");
      optGroupElem.label = eventName.replace(groupPrefix, "");
      $("select-event").add(optGroupElem, null);
    } else {
      let eventOptionElem = document.createElement("option");
      eventOptionElem.value = eventOptionElem.text = eventName;
      optGroupElem.appendChild(eventOptionElem);
    }
  });

}

function populateEventOptionsForEdge() {
  eventList.forEach(function(eventName) {
    if (!eventName.startsWith(groupPrefix)) {
      let eventOptionElem = document.createElement("option");
      eventOptionElem.value = eventOptionElem.text = eventName;
      $("select-event").add(eventOptionElem, null);
    }
  });

}

function hasSelectedValue(selectElem, queryValue) {
  let selectedOptions = selectElem.selectedOptions;
  // JS for-each iterator doesn't work in Edge!
  for (let i = selectedOptions.length - 1; i >= 0; i--) {
    if (selectedOptions[i].value == queryValue)
      return true;
  }
  return false;
}

function callWindowOpen(label) {
  let link = "http://www.example.com/?label=" + label;
  let result = window.open(link);
  log("window.open on '" + label + "' " + (result ? "success" : "failure"));
}

function callNone(label) {
  log("no-op on '" + label + "'");
}

function addEventListener() {
  eventList.forEach(function(eventName) {
    if (!eventName.startsWith(groupPrefix)) {
      $("target").addEventListener(eventName, function(e) {
        if (!hasSelectedValue($("select-event"), eventName))
          return;

        switch($("triggered-api").options[$("triggered-api").selectedIndex].value) {
          case "window.open":
            callWindowOpen(e.type);
            break;

          case "none":
            callNone(e.type);
            break;
        }
      });
    }
  });
}

function init() {
  if (navigator.userAgent.indexOf("Edge") == -1)
    populateEventOptions();
  else
    populateEventOptionsForEdge();

  addEventListener();
}
