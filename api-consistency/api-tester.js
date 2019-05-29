/*******************************************************************************
  API Tester: Maintains a list of APIs, provides UI to choose one, and
  facilitates testing from user activation perspective.
*******************************************************************************/

(scope => {

  // List of APIs.  A map from apiLabel string to an apiObject which contains
  // two things: {a function returning a promise, an HTML element}.
  let apiList = {

    "window.open": {
      promise: () => {
	return new Promise((resolve, reject) => {
	  if (window.open("about:blank"))
          resolve();
	  else
          reject();
	});
      },
      targetInnerHtml: undefined,
    },

    "elem.requestFullscreen": {
      promise: elem => {
	if (elem.requestFullscreen) {
	  return elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) { /* Firefox */
	  return elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) { /* Safari */
	  return elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE/Edge */
	  return elem.msRequestFullscreen();
	}
      },
      targetInnerHtml: "This div would go fullscreen.",
    },

    "navigator.vibrate": {
      promise: () => {
	return new Promise((resolve, reject) => {
	  if (navigator.vibrate(100))
          resolve();
	  else
          reject();
	});
      },
      targetInnerHtml: undefined,
    },

    "audio.play": {
      promise: elem => {
	return elem.play();
      },
      targetInnerHtml: "<audio controls " +
	  "src='https://interactive-examples.mdn.mozilla.net/media/examples/t-rex-roar.mp3'>" +
	  "Audio is not supported." +
	  "</audio>",
    },

  }; //  apiList


  // API selector interface.

  const localStorageKey = "selectedApiLabel";

  function public_setupApiSelector() {
    const apiSelectElem = $("test-api");

    Object.keys(apiList).forEach(apiLabel => {
      // Add an option.
      let apiOptionElem = document.createElement("option");
      apiOptionElem.value = apiLabel;
      apiOptionElem.text = apiLabel;
      apiOptionElem.selected = (localStorage[localStorageKey] == apiLabel);
      apiSelectElem.add(apiOptionElem);
    });

    apiSelectElem.addEventListener("change", apiSelectElemChanged);
    apiSelectElemChanged();
  }

  function public_getSelectedApi() {
    const apiSelectElem = $("test-api");
    return apiSelectElem.options[apiSelectElem.selectedIndex].value;
  }

  function apiSelectElemChanged() {
    localStorage[localStorageKey] = public_getSelectedApi();
  }


  // API caller interface.

  function public_setupApiCaller() {
    const apiTargetElem = $("api-test-area");
    apiTargetElem.innerHTML = "<div>" +
	"<strong>API test area.  Do not interact with anything here.</strong>" +
	"</div>";

    Object.keys(apiList).forEach(apiLabel => {
      let targetInnerHtml = apiList[apiLabel].targetInnerHtml;
      if (targetInnerHtml) {
	// Add a target div.
	let apiTargetDiv = document.createElement("div");
	apiTargetDiv.id = labelToTargetId(apiLabel);
	apiTargetDiv.innerHTML = targetInnerHtml;
	apiTargetElem.appendChild(apiTargetDiv);
      }
    });
  }

  function public_callApi(apiLabel) {
    // Locate the element on which to call the test API.  For some API
    // (e.g. audio.play()), the call has to be on the child of the container div
    // element.
    let apiCallElem = $(labelToTargetId(apiLabel));
    if (apiCallElem && apiCallElem.firstElementChild)
      apiCallElem = apiCallElem.firstElementChild;

    apiList[apiLabel].promise(apiCallElem)
	.then(() => logApiSuccess(apiLabel))
	.catch(() => logApiFailure(apiLabel));
  }

  function logApiSuccess(apiLabel) {
    log(apiLabel + " success", "lightgreen");
  }

  function logApiFailure(apiLabel) {
    log(apiLabel + " failure", "lightpink");
  }

  function labelToTargetId(label) {
    return label ? ("target-" + label) : undefined;
  }

  function initialize() {
    if (scope.apiTester)
    return;

    scope.apiTester = {
      setupApiSelector: public_setupApiSelector,
      getSelectedApi: public_getSelectedApi,
      setupApiCaller: public_setupApiCaller,
      callApi: public_callApi,
    };
  }

  initialize();
})(self);
