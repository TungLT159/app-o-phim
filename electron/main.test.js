/**
 * @jest-environment node
 */

const path = require("path");

describe("Electron main watch history integration", () => {
  let app;
  let BrowserWindow;
  let ipcMain;
  let registeredHandlers;
  let createdWindowOptions;

  beforeEach(() => {
    jest.resetModules();
    registeredHandlers = new Map();
    createdWindowOptions = undefined;

    app = {
      getPath: jest.fn(() => "C:\\Users\\test\\AppData\\Roaming\\OPhim"),
      whenReady: jest.fn(() => ({ then: jest.fn() })),
      on: jest.fn(),
      quit: jest.fn(),
    };
    BrowserWindow = jest.fn((options) => {
      createdWindowOptions = options;
      return { loadURL: jest.fn(), on: jest.fn() };
    });
    BrowserWindow.getAllWindows = jest.fn(() => []);
    ipcMain = {
      handle: jest.fn((channel, handler) => {
        registeredHandlers.set(channel, handler);
      }),
    };

    jest.doMock("electron", () => ({
      app,
      BrowserWindow,
      dialog: { showErrorBox: jest.fn() },
      ipcMain,
    }));
    jest.doMock("../server", () => ({
      startAppServer: jest.fn().mockResolvedValue({ url: "http://localhost:3000", close: jest.fn() }),
    }));
  });

  afterEach(() => {
    jest.dontMock("electron");
    jest.dontMock("../server");
  });

  test("registers watch history ipc handlers", () => {
    require("./main");

    expect(ipcMain.handle).toHaveBeenCalledWith("watch-history:read", expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith("watch-history:write", expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith("watch-history:clear", expect.any(Function));
    expect(registeredHandlers.has("watch-history:read")).toBe(true);
    expect(registeredHandlers.has("watch-history:write")).toBe(true);
    expect(registeredHandlers.has("watch-history:clear")).toBe(true);
  });

  test("creates BrowserWindow with preload and secure webPreferences", async () => {
    const { createMainWindow } = require("./main");

    await createMainWindow();

    expect(createdWindowOptions.webPreferences).toEqual({
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    });
  });
});
