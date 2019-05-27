(scope => {
  function labelToTargetId(label) {
    return label ? ("target-" + label) : undefined;
  }

  function windowOpenPromise() {
    return new Promise((resolve, reject) => {
      if (window.open("about:blank"))
        resolve();
      else
        reject();
    });
  }

  function requestFullscreenPromise(elem) {
    if (elem.requestFullscreen) {
      return elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      return elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      return elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      return elem.msRequestFullscreen();
    }
  }

  function navigatorVibratePromise() {
    return new Promise((resolve, reject) => {
      if (navigator.vibrate(100))
        resolve();
      else
        reject();
    });
  }

  function audioPlayPromise(elem) {
    return elem.play();
  }

  let apiList = [
    {
      label: "window.open",
      promise: windowOpenPromise,
      targetInnerHtml: undefined,
    },
    {
      label: "elem.requestFullscreen",
      promise: requestFullscreenPromise,
      targetInnerHtml: "This div would go fullscreen.",
    },
    {
      label: "navigator.vibrate",
      promise: navigatorVibratePromise,
      targetInnerHtml: undefined,
    },
    {
      label: "audio.play",
      promise: audioPlayPromise,
      targetInnerHtml: "<audio controls " +
	  "src='https://interactive-examples.mdn.mozilla.net/media/examples/t-rex-roar.mp3'>" +
	  "Audio is not supported." +
	  "</audio>",
    },
  ];

  let selectedApiObject = undefined;
  const localStorageKey = "selectedApiLabel";

  function apiSelectElemChanged() {
    const apiSelectElem = $("test-api");

    let selectedApiLabel = apiSelectElem.options[apiSelectElem.selectedIndex].value;
    localStorage[localStorageKey] = selectedApiLabel;

    apiList.forEach(apiObject => {
      let selected = (selectedApiLabel == apiObject.label);

      if (selected)
        selectedApiObject = apiObject;

      if (apiObject.targetInnerHtml)
        $(labelToTargetId(apiObject.label)).hidden = !selected;
    });
  }

  function public_setup() {
    const apiSelectElem = $("test-api");

    const apiTargetElem = $("test-api-target");
    apiTargetElem.innerHTML = "<div>Do not interact here.</div>";

    apiList.forEach(apiObject => {
      // Add an option.
      let apiOptionElem = document.createElement("option");
      apiOptionElem.value = apiObject.label;
      apiOptionElem.text = apiObject.label;
      apiOptionElem.selected =
	  (localStorage[localStorageKey] == apiObject.label);
      apiSelectElem.add(apiOptionElem);

      if (apiObject.targetInnerHtml) {
	// Add a target div.
	let apiTargetDiv = document.createElement("div");
	apiTargetDiv.id = labelToTargetId(apiObject.label);
	apiTargetDiv.innerHTML = apiObject.targetInnerHtml;
	apiTargetElem.appendChild(apiTargetDiv);
      }
    });

    apiSelectElem.addEventListener("change", apiSelectElemChanged);
    apiSelectElemChanged();
  }

  function logApiSuccess() {
    log(selectedApiObject.label + " success", "lightgreen");
  }

  function logApiFailure() {
    log(selectedApiObject.label + " failure", "lightpink");
  }

  function public_callAndLog() {
    if (!selectedApiObject) {
      log("No API selected", "lightgrey");
      return;
    }

    let apiCallElem = $(labelToTargetId(selectedApiObject.label));
    // For some API (e.g. audio.play()), the call has to be on a child of the <div>.
    if (apiCallElem && apiCallElem.firstElementChild)
      apiCallElem = apiCallElem.firstElementChild;

    selectedApiObject.promise(apiCallElem)
	.then(logApiSuccess).catch(logApiFailure);
  }

  function initialize() {
    if (scope.apiSelector)
      return;
    scope.apiSelector = {setup: public_setup, callAndLog: public_callAndLog};
  }

  initialize();
})(self);
