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

    "input-type-file": {
      promise: elem => {
        return new Promise((resolve, reject) => {
          elem.click();
          if (confirm("Did you just see a file dialog?"))
            resolve();
          else
            reject();
        });
      },
      targetInnerHtml: "<input type='file' />",
    },

    "input-type-color": {
      promise: elem => {
        return new Promise((resolve, reject) => {
          elem.click();
          if (confirm("Did you just see a color-picker dialog?"))
            resolve();
          else
            reject();
        });
      },
      targetInnerHtml: "<input type='color' /> Color picker.",
    },

    "execCommand-copy": {
      promise: elem => {
        return new Promise((resolve, reject) => {
          elem.focus();
          elem.select();
          if (document.execCommand("copy"))
            resolve();
          else
            reject();
        });
      },
      targetInnerHtml: "<input type='text' style='width: 3em' value='abc' />",
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
    const apiTargetElem = $("api-elem-area");

    Object.keys(apiList).forEach(apiLabel => {
      let targetInnerHtml = apiList[apiLabel].targetInnerHtml;
      if (targetInnerHtml) {
        // Add a target div.
        let apiTargetDiv = document.createElement("div");
        apiTargetDiv.id = labelToTargetId(apiLabel);
        apiTargetDiv.className = "api-elem-area-entry";
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
    log(apiLabel + " success", "green");
  }

  function logApiFailure(apiLabel) {
    log(apiLabel + " failure", "red");
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
