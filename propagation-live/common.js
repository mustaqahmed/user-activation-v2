var frameLabel;

function $(id) {
  return document.getElementById(id);
}

function refreshStateIndicators() {
  if (!navigator.userActivation)
    return;
  document.body.style.backgroundColor =
      (navigator.userActivation.hasBeenActive ? "#d0ffd0" : "white");
  $("frame-label").style.color =
      (navigator.userActivation.isActive ? "green" : "lightgrey");
}

function commonInit(label) {
  frameLabel = label;
  $("frame-label").innerHTML += " " + label;

  setInterval(refreshStateIndicators, 500);
}
