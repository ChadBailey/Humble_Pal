exports.stringReduce = function(x) {
  return x.toLowerCase().replace(/[^a-z0-9]/g, '');
};

exports.addEntitlements = function(nodelist) {
  for (let node of nodelist) {
    let gamename = node.getAttribute('data-machine-name');
    let gamediv = node.querySelector('div[class*="keyfield"]');
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
          };
        };
      });
    };
  };
};

// .addEntitlements(document.querySelectorAll("div.choice-image-container.js-admin-edit"));
