import { DefaultConfig } from "../common/default-config.mjs";
import { game } from "./game.mjs";

document.getElementById("config").addEventListener("click", showSettingsPopup);

// TODO: Better interface for keybindings.

function showSettingsPopup() {
  const popup = document.createElement("div");
  popup.classList.add("settings-popup");

  const dimmer = document.createElement("div");
  dimmer.classList.add("dimmer");

  const content = document.createElement("div");
  content.classList.add("content");

  const header = document.createElement("h1");
  header.textContent = "Settings";

  const jsonHolder = document.createElement("textarea");
  jsonHolder.textContent = JSON.stringify(getCurrentConfig(), null, 2);

  const keyPreviewWrapper = document.createElement("p");
  keyPreviewWrapper.textContent = "The last key you pressed was: ";
  const keyPreview = document.createElement("kbd");
  keyPreview.textContent = "<No Data>";
  keyPreviewWrapper.appendChild(keyPreview);

  const copyKeyPreview = document.createElement("button");
  copyKeyPreview.textContent = "Copy Key";
  copyKeyPreview.addEventListener("click", () => {
    navigator.clipboard.writeText(keyPreview.textContent);
  });

  //#region saveLocation
  const saveLocationWrapper = document.createElement("div");
  const saveLocationLabel = document.createElement("p");
  saveLocationLabel.textContent = "Where to save your settings:";
  saveLocationWrapper.appendChild(saveLocationLabel);

  const localStorageSaveLocation = document.createElement("input");
  localStorageSaveLocation.type = "radio";
  localStorageSaveLocation.name = "save-location";
  localStorageSaveLocation.id = "local-storage";
  localStorageSaveLocation.checked = true;
  const localStorageSaveLocationLabel = document.createElement("label");
  localStorageSaveLocationLabel.htmlFor = "local-storage";
  localStorageSaveLocationLabel.textContent = "Local Storage";
  saveLocationWrapper.appendChild(localStorageSaveLocation);
  saveLocationWrapper.appendChild(localStorageSaveLocationLabel);
  saveLocationWrapper.appendChild(document.createElement("br"));

  const sessionStorageSaveLocation = document.createElement("input");
  sessionStorageSaveLocation.type = "radio";
  sessionStorageSaveLocation.name = "save-location";
  sessionStorageSaveLocation.id = "session-storage";
  const sessionStorageSaveLocationLabel = document.createElement("label");
  sessionStorageSaveLocationLabel.htmlFor = "session-storage";
  sessionStorageSaveLocationLabel.textContent = "Session Storage";
  saveLocationWrapper.appendChild(sessionStorageSaveLocation);
  saveLocationWrapper.appendChild(sessionStorageSaveLocationLabel);
  saveLocationWrapper.appendChild(document.createElement("br"));
  //#endregion

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";

  content.appendChild(header);
  content.appendChild(jsonHolder);
  content.appendChild(keyPreviewWrapper);
  content.appendChild(copyKeyPreview);
  content.appendChild(document.createElement("hr"));
  content.appendChild(saveLocationWrapper);
  content.appendChild(document.createElement("br"));
  content.appendChild(saveButton);
  content.appendChild(cancelButton);

  popup.appendChild(content);

  popup.style.position = "absolute";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.backgroundColor = "#30353d";
  popup.style.padding = "20px";
  popup.style.borderRadius = "5px";
  popup.style.zIndex = "2";
  popup.style.minWidth = "300px";

  dimmer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  dimmer.style.position = "fixed";
  dimmer.style.top = "0";
  dimmer.style.left = "0";
  dimmer.style.right = "0";
  dimmer.style.bottom = "0";
  dimmer.style.zIndex = "1";

  jsonHolder.style.minWidth = "280px";
  jsonHolder.style.minHeight = "100px";

  document.body.appendChild(dimmer);
  document.body.appendChild(popup);

  const keyListener = window.addEventListener("keydown", function (ev) {
    keyPreview.textContent = ev.key.toLowerCase();
  });

  function commonShutdown() {
    window.removeEventListener("keydown", keyListener);
    dimmer.remove();
    popup.remove();
  }

  saveButton.addEventListener("click", () => {
    // Save logic
    game.sendConfigUpdateToServer(JSON.parse(jsonHolder.value));
    switch (document.querySelector('input[name="save-location"]:checked').id) {
      case "local-storage":
        localStorage.setItem("config", jsonHolder.value);
        break;
      case "session-storage":
        sessionStorage.setItem("config", jsonHolder.value);
        break;
    }
    commonShutdown();
  });

  cancelButton.addEventListener("click", () => {
    commonShutdown();
  });
}

export function getCurrentConfig() {
  const session = sessionStorage.getItem("config");
  if (session) {
    return JSON.parse(session);
  }

  const local = localStorage.getItem("config");
  if (local) {
    return JSON.parse(local);
  }

  return JSON.parse(JSON.stringify(DefaultConfig));
}
