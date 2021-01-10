// 'use strict';

// Const vals
const steam_url = "https://store.steampowered.com/account/registerkey?key=";
const humble_url = "https://www.humblebundle.com/";
const steamKeyRegex = "^[\\w]{5}-[\\w]{5}-[\\w]{5}(-[\\w]{5}-[\\w]{5}){0,1}$";
const steam_successs_indicator = "ACTIVATION SUCCESSFUL!";
const steam_already_owned_indicator =
  "This Steam account already owns the product(s) contained in this offer. To access them, visit your library in the Steam client.";
const steam_another_account =
  "The product code you've entered has already been activated by a different Steam account. This code cannot be used again. Please contact the retailer or online seller where the code was purchased for assistance.";

function humble_apply_style(node, keydiv, account) {
  node.querySelector("div.steam-redeem-text").innerHTML =
    "Redeemed to " + account;
  node.querySelector("a.steam-redeem-button").style.background = "gray";
  keydiv.style.color = "gray";
  keydiv.style.background = "lightgray";
  keydiv.style.borderColor = "gray";
}

function humble_deapply_style(node, keydiv, account) {
  node.querySelector("div.steam-redeem-text").innerHTML = "Redeem";
  node.querySelector("a.steam-redeem-button").style.background = "";
  keydiv.style.color = "";
  keydiv.style.background = "";
  keydiv.style.borderColor = "";
}

function humble_handle_keys(nodelist) {
  for (let node of nodelist) {
    let keydiv = node.querySelector('div[class*="keyfield"]');
    // Must check if found, otherwise unrevealed keys will cause an error.
    if (keydiv) {
      let steamKey = keydiv.querySelector("div.keyfield-value").innerText;
      chrome.storage.sync.get([steamKey], function (result) {
        for (var key in result) {
          if (result[key].account) {
            // humble_apply_style(node, keydiv, account);
            node.querySelector("div.steam-redeem-text").innerHTML =
              "Redeemed to " + result[key].account;
            node.querySelector("a.steam-redeem-button").style.background =
              "gray";
            keydiv.style.color = "gray";
            keydiv.style.background = "lightgray";
            keydiv.style.borderColor = "gray";
          }
        }
      });
    }
  }
}

function humble_mark_redeemed(nodelist) {
  if (!nodelist) {
    nodelist = document.querySelectorAll("div.key-redeemer");
  }
  if (nodelist.length > 0) {
    humble_handle_keys(nodelist);
  }
}

function steam_check_for_success() {
  try {
    // Should always work
    let key = document.URL.split("=").slice(-1)[0];
    let username = document.querySelector("span.persona").innerText;
    // Should always be either a blank string (no error), or a string identifying the error
    let error_text = document.getElementById("error_display").innerText;
    // On success should always be "ACTIVATION SUCCESSFUL!", on failure unsure.
    let success_text = document.querySelector("div#receipt_form > h2")
      .innerText;

    if (success_text === steam_successs_indicator && error_text === "") {
      // Follow success flow
      console.log(
        "Humble Pal: Product successfully redeemed to account :" +
          username +
          "\n\n" +
          success_text
      );
      let keyData = {
        status: "redeemed",
        account: username,
      };
      // !! IMPORTANT !! *NEVER* Store unredeemed keys as they aren't encrypted
      // https://developer.chrome.com/docs/extensions/reference/storage/#usage
      chrome.storage.sync.set({ [key]: keyData }, function () {
        console.log(
          "Humble pal: Key data " + keyData + " successfully stored."
        );
      });
      window.close();
    } else if (error_text !== "") {
      // Attempt to follow known-error flow
      if (error_text === steam_already_owned_indicator) {
        console.log(
          "Humble Pal: Product has already been redeemed. Marking as redeemed to account :" +
            username +
            "\n\n" +
            error_text
        );
        let keyData = {
          status: "redeemed",
          account: username,
        };
        // !! IMPORTANT !! *NEVER* Store unredeemed keys as they aren't encrypted
        // https://developer.chrome.com/docs/extensions/reference/storage/#usage
        chrome.storage.sync.set({ [key]: keyData }, function () {
          console.log(
            "Humble pal: Key data" + keyData + " successfully stored."
          );
        });
        window.close();
      } else {
        // Follow unknown-error flow
        console.log(
          "Humble Pal: Steam is reporting the following error\n\n" + error_text
        );
      }
    } else {
      // Follow unknown-error flow
      alert(
        "ERROR: Unexpected response! This should -never- happen, so the \
      activation feature should be considered unsafe to use until an update \
      is published resolving the issue."
      );
    }
  } catch (error) {
    // Follow unknown-error flow
    console.log("Humble Pal: The following error has occurred\n\n" + error);
  }
}

function steam_main() {
  let steamKey = document.URL.split("=").slice(-1)[0];
  let observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      console.log(
        "Mutation observed: " +
          mutation.target +
          " Class: " +
          mutation.target.className
      );
      if (mutation.target.className == "checkout_error") {
        console.log("Humble Pal: Error message mutated");
        steam_check_for_success();
      }
      if (
        mutation.target.classList.contains("registerkey_form") ||
        mutation.target.classList.contains("registerkey_lineitem") ||
        mutation.target.classList.contains("registerkey_productlist")
      ) {
        console.log("Humble Pal: Success message mutated");
        steam_check_for_success();
      }
      for (let addedNode of mutation.addedNodes) {
        debug_mutations(addedNode);
      }
    }
  });
  observer.observe(document, { childList: true, subtree: true });

  try {
    if (steamKey.match(steamKeyRegex)) {
      document.getElementsByName("accept_ssa")[0].checked = true;
      document.getElementById("register_btn").click();
    }
  } catch (error) {
    console.log(error);
  }
}

function debug_mutations(addedNode) {
  if (addedNode.nodeName !== "#text") {
    console.log(
      "Mutation observed: " +
        addedNode.nodeName +
        " Class: " +
        addedNode.className
    );
  }
  if (addedNode.nodeName === "DIV") {
    console.log(
      "Mutation observed: " +
        addedNode.nodeName +
        " Class: " +
        addedNode.className
    );
    if (addedNode.classList.contains("choice-modal")) {
      console.log("Popup detected");
    }
    if (addedNode.querySelectorAll("div.key-redeemer")) {
    }
  }
}

function detect_keys(node) {
  if (node) {
    return node.querySelectorAll("div.key-redeemer");
  }
  return document.querySelectorAll("div.key-redeemer");
}

function humble_main() {
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    humble_mark_redeemed();
  });
  let observer = new MutationObserver((mutations) => {
    let keys_found = false; // Sentinel to prevent duplication of work
    for (let mutation of mutations) {
      for (let addedNode of mutation.addedNodes) {
        if (mutation.type === "childList") {
          if (["TR", "DIV"].includes(addedNode.nodeName)) {
            keys_found = detect_keys();
          }
        }
      }
      if (keys_found) {
        break;
      }
    }
    if (keys_found) {
      humble_mark_redeemed(keys_found);
    }
  });
  observer.observe(document, { childList: true, subtree: true });
  // Always check, as the key could have come in on the initial load
  let keys_found = detect_keys();
  if (keys_found.length > 0) {
    humble_mark_redeemed(keys_found);
  }
}

if (document.URL.indexOf(steam_url) >= 0) {
  chrome.storage.local.get("enabled", function (data) {
    if (data.enabled) {
      steam_main();
    }
  });
}

if (document.URL.indexOf(humble_url) >= 0) {
  chrome.storage.local.get("enabled", function (data) {
    if (data.enabled) {
      humble_main();
    }
  });
}
