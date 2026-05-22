const { autoUpdater } = require("electron-updater");

function getUpdateVersion(info) {
  return info?.version || "";
}

function createUpdateService({ app, getWindow }) {
  let state = { status: app.isPackaged ? "idle" : "disabled" };
  let eventsWired = false;

  autoUpdater.autoDownload = false;

  const broadcast = (nextState) => {
    state = nextState;
    getWindow()?.webContents?.send?.("updates:state-changed", state);
    return state;
  };

  const wireAutoUpdaterEvents = () => {
    if (eventsWired) return;
    eventsWired = true;

    autoUpdater.on("checking-for-update", () => {
      broadcast({ status: "checking" });
    });
    autoUpdater.on("update-available", (info) => {
      broadcast({ status: "available", version: getUpdateVersion(info) });
    });
    autoUpdater.on("update-not-available", () => {
      broadcast({ status: "not-available" });
    });
    autoUpdater.on("download-progress", (progress) => {
      broadcast({ status: "download-progress", percent: Math.round(progress?.percent || 0) });
    });
    autoUpdater.on("update-downloaded", (info) => {
      broadcast({ status: "downloaded", version: getUpdateVersion(info) });
    });
    autoUpdater.on("error", (error) => {
      broadcast({ status: "error", message: error?.message || "Khong the kiem tra cap nhat" });
    });
  };

  const checkForUpdates = async () => {
    if (!app.isPackaged) {
      state = { status: "disabled" };
      return state;
    }

    wireAutoUpdaterEvents();
    broadcast({ status: "checking" });
    await autoUpdater.checkForUpdates();
    return state;
  };

  const downloadUpdate = async () => {
    if (!app.isPackaged) return state;
    await autoUpdater.downloadUpdate();
    return state;
  };

  const installUpdate = () => {
    if (app.isPackaged) {
      autoUpdater.quitAndInstall(false, true);
    }
    return state;
  };

  return {
    checkForUpdates,
    downloadUpdate,
    getState: () => state,
    installUpdate,
    wireAutoUpdaterEvents,
  };
}

module.exports = { createUpdateService };
