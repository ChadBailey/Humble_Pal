const browser = chrome;
const HUMBLE_PAL_VERSION = "v0.1 Alpha";
var account_map = {};

function openHumblePalModal(tab_id, msg, style) {
  humblePalHeader = "Humble Pal";
  humblePalModalRedeemGradient = "linear-gradient(to bottom, #cc8033, #d04c35)";
  humblePalModalUnRedeemGradient =
    "linear-gradient(to bottom, #97b147, #6A7D32)";
  humblePalModalErrorGradient = "linear-gradient(to bottom, #8F46B0, #4A1463)";

  if (style === "unredeem") {
    humblePalModalGradient = humblePalModalUnRedeemGradient;
  } else if (style === "redeem") {
    humblePalModalGradient = humblePalModalRedeemGradient;
  } else if (style === "error") {
    humblePalModalGradient = humblePalModalErrorGradient;
  }

  humblePalModalHtml =
    `
<div
  id="humblePalModal"
  style="
    display: block;
    font-family: Arial, Helvetica, sans-serif;
    position: fixed;
    z-index: 99999;
    padding-top: 20%;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.4);
">
  <div
    id="humblePalModalContent"
    style="
      position: absolute;
      background-color: #fefefe;
      padding: 0;
      border-radius: 4px;
      left: 17.5%;
      width: 65%;
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
      animation: 'pulse 1.2s ease-in-out';
  ">
    <span
      id="humblePalModalClose"
      style="
        color: white;
        float: right;
        font-size: 28px;
        font-weight: bold;
        padding-right: 0.2em;
      "
      onMouseOut="
        this.style.color='white';
        this.style.float='right';
        this.style.fontSize='28px';
        this.style.fontWeight='bold';
      "
      onMouseOver="
        this.style.color='#000';
        this.style.textDecoration='none';
        this.style.cursor='pointer';
    ">&times;</span>
    <div id="humblePalModalHeader"
    style="
      padding: 2px 16px;
      border-radius: 4px 4px 0 0;
      background-image: ` +
    humblePalModalGradient +
    `;
      color: white;
    ">
      <h2
      style="
        display: block;
        font-size: 1em;
        margin-block-start: 0.5em;
        margin-block-end: 0.5em;
        margin-inline-start: 0;
        margin-inline-end: 0;
        font-weight: bold;
      "
      >` +
    humblePalHeader +
    `</h2>
    </div>
    <div id="humblePalModalBody"
    style="
      padding: 2px 16px;
      margin-block-start: 1em;
      margin-block-end: 1em;
    ">
      <span>` +
    msg +
    `</span>
    </div>
    <div id="humblePalModalFooter"
    style="
      padding: 2px 16px;
      border-radius: 0 0 4px 4px;
      background-image: ` +
    humblePalModalGradient +
    `;
      color: white;
    ">
      <h3
      style="
        display: block;
        font-size: 0.8em;
        margin-block-start: 0.3em;
        margin-block-end: 0.3em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        font-weight: bold;
      ">` +
    HUMBLE_PAL_VERSION +
    `</h3>
    </div>
  </div>
</div>
`;
  browser.tabs.executeScript(tab_id, {
    code: `console.log('Opening Modal!');`,
  });

  browser.tabs.executeScript(tab_id, {
    code:
      'document.body.insertAdjacentHTML("beforebegin", `' +
      humblePalModalHtml +
      "`);",
  });

  browser.tabs.executeScript(tab_id, {
    code: `
      var humblePalModal = document.getElementById("humblePalModal");
      var humblePalModalClose = document.getElementById("humblePalModalClose");
      // When the user clicks on <span> (x), humblePalModalClose the modal
      humblePalModalClose.onclick = function () {
        document.querySelector("div#humblePalModal").remove();
      };
      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function (event) {
        if (event.target == humblePalModal) {
          humblePalModal.remove();
        }
      };
      `,
  });
}

function redeem(steamKey, account, tab_id) {
  chrome.storage.local.get("enabled", function (data) {
    if (data.enabled) {
      steamKeyRegex = "^[\\w]{5}-[\\w]{5}-[\\w]{5}(-[\\w]{5}-[\\w]{5}){0,1}$";
      if (steamKey.match(steamKeyRegex)) {
        if (!account) {
          account = prompt("Please enter the steam account name", "");
        }
        let keyData = {
          status: "redeemed",
          account: account,
        };
        chrome.storage.sync.get("accounts", function (result) {
          var found = false;
          for (let a of result.accounts) {
            if (a === account) {
              found = true;
              break;
            }
          }
          if (!found) {
            result.accounts.push(account);
            chrome.storage.sync.set({ accounts: result.accounts }, function () {
              console.log("Added account to db: " + account);
            });
          }
        });
        chrome.storage.sync.set({ [steamKey]: keyData }, function () {
          console.log(
            "Humble pal: Key data " + keyData + " successfully stored."
          );
        });
      } else {
        openHumblePalModal(
          tab_id,
          `
Redeem failed (invalid link)<br>
<br>
To use, right click on a steam redemption link, beginning with:
<span style='font-weight:bold;'>https://store.steampowered.com/account/registerkey?key=</span>.
<br>
<br>
NOTE: This should be any button on humblebundle labeled "Redeem" or "Redeemed to &lt;account&gt;".
    `,
          "error"
        );
      }
    } else {
      openHumblePalModal(
        tab_id,
        "Error: Humble Pal is disabled (click extension icon to re-enable)",
        "error"
      );
    }
  });
}

function unredeem(steamKey, tab_id) {
  chrome.storage.local.get("enabled", function (data) {
    if (data.enabled) {
      steamKeyRegex = "^[\\w]{5}-[\\w]{5}-[\\w]{5}(-[\\w]{5}-[\\w]{5}){0,1}$";
      if (steamKey.match(steamKeyRegex)) {
        chrome.storage.sync.remove([steamKey]);
        browser.tabs.executeScript(tab_id, {
          code: `humble_mark_redeemed();`,
        });
        openHumblePalModal(
          tab_id,
          "Unmarked <span style='font-weight:bold;'>" +
            steamKey +
            `</span> as redeemed.<br>
<br>
<span style="font-size: 12px; font-weight: bold;">IMPORTANT: Marking or unmarking as redeemed is for visual purposes only and does 
not actually redeem or unredeem products (which is not possible to do anyway).</span>`,
          "unredeem"
        );
      } else {
        openHumblePalModal(
          tab_id,
          `Unredeem failed (invalid link)<br><br>To use, right click on a steam 
redemption link, beginning with: 
<span style='font-weight:bold;'>https://store.steampowered.com/account/registerkey?key=</span>`,
          "error"
        );
      }
    } else {
      openHumblePalModal(
        tab_id,
        "Error: Humble Pal is disabled (click extension icon to re-enable)",
        "error"
      );
    }
  });
}

function unredeem_callback(info, tab) {
  targetUrl = info.linkUrl;
  let steamKey = targetUrl.split("=").slice(-1)[0];
  unredeem(steamKey, tab.id);
}

function set_up_context_unredeem() {
  var title = "Unmark as redeemed";
  var id = browser.contextMenus.create({
    title: title,
    contexts: ["link"],
    onclick: unredeem_callback,
  });
  console.log("Unmark as redeemed");
}

function redeem_callback(info, tab) {
  account = account_map[info.menuItemId];
  targetUrl = info.linkUrl;
  let steamKey = targetUrl.split("=").slice(-1)[0];
  redeem(steamKey, account, tab.id);
}

function set_up_context_redeem_to_account() {
  chrome.storage.sync.get("accounts", function (result) {
    for (let account in result.accounts) {
      var title = "Mark as redeemed to account " + result.accounts[account];
      var id = browser.contextMenus.create({
        title: title,
        contexts: ["link"],
        onclick: redeem_callback,
      });
      account_map[id] = result.accounts[account];
    }
    var title = "Mark as redeemed to account ...";
    var id = browser.contextMenus.create({
      title: title,
      contexts: ["link"],
      onclick: redeem_callback,
    });
    console.log("Adding context menu: Mark as redeemed to account ...");
  });
}

function steam_search(info, tab) {
  chrome.tabs.create({
    url: "https://store.steampowered.com/search/?term=" + info.selectionText,
  });
}

function set_up_context_search_steam() {
  chrome.contextMenus.create({
    title: "Humble Pal - Search Steam for: %s",
    contexts: ["selection"],
    onclick: steam_search,
  });
}

function set_up_contexts() {
  set_up_context_search_steam();
  set_up_context_redeem_to_account();
  set_up_context_unredeem();
}

set_up_contexts();
