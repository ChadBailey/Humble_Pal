chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "loading") {
    chrome.tabs.executeScript(tabId, { file: "onready.js" });
  }
});

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({ enabled: true }, function () {
    console.log("Humble pal is enabled.");
    updateIcon(true);
  });
});

function reload_activetab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.reload(tabs[0].id);
  });
}

function toggleStatus() {
  chrome.storage.local.get("enabled", function (data) {
    // NOTE: Opposite of current state, since that will be the new state
    var enabled = !data.enabled;
    updateIcon(enabled);
    chrome.storage.local.set({ enabled: enabled }, function () {
      if (enabled === true) {
        console.log("Humble pal is enabled.");
        reload_activetab();
      } else {
        console.log("Humble pal is disabled.");
        reload_activetab();
      }
    });
  });
}

function updateIcon(enabled) {
  if (enabled === true) {
    chrome.browserAction.setIcon({ path: "icons/humble_pal128.png" });
  } else {
    chrome.browserAction.setIcon({ path: "icons/humble_pal_disabled.png" });
  }
}

chrome.browserAction.onClicked.addListener(toggleStatus);
