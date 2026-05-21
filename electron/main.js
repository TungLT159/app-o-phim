const path = require("path");
const { app, BrowserWindow, dialog } = require("electron");
const { startAppServer } = require("../server");

const appIcon = path.join(__dirname, "..", "build", "logo.png");

let mainWindow;
let appServer;

async function createMainWindow() {
  appServer = await startAppServer({
    port: 0,
    buildDir: path.join(__dirname, "..", "build"),
  });

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: "#000000",
    icon: appIcon,
    title: "O Phim",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  await mainWindow.loadURL(appServer.url);
}

async function closeAppServer() {
  if (!appServer) return;
  const currentServer = appServer;
  appServer = null;
  await currentServer.close();
}

app.whenReady().then(() => {
  createMainWindow().catch((error) => {
    dialog.showErrorBox("Khong the khoi dong O Phim", error.message);
    app.quit();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow().catch((error) => {
      dialog.showErrorBox("Khong the khoi dong O Phim", error.message);
      app.quit();
    });
  }
});

app.on("before-quit", (event) => {
  if (!appServer) return;
  event.preventDefault();
  closeAppServer()
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      app.quit();
    });
});
