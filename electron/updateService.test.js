/**
 * @jest-environment node
 */

describe("update service", () => {
  let autoUpdater;
  let app;
  let window;

  beforeEach(() => {
    jest.resetModules();
    autoUpdater = {
      autoDownload: true,
      on: jest.fn(),
      checkForUpdates: jest.fn().mockResolvedValue(undefined),
      downloadUpdate: jest.fn().mockResolvedValue(undefined),
      quitAndInstall: jest.fn(),
    };
    app = { isPackaged: true };
    window = { webContents: { send: jest.fn() } };

    jest.doMock("electron-updater", () => ({ autoUpdater }));
  });

  afterEach(() => {
    jest.dontMock("electron-updater");
  });

  test("does not check updates when app is not packaged", async () => {
    app.isPackaged = false;
    const { createUpdateService } = require("./updateService");
    const service = createUpdateService({ app, getWindow: () => window });

    await service.checkForUpdates();

    expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled();
    expect(service.getState()).toEqual({ status: "disabled" });
  });

  test("broadcasts available and downloaded update states", () => {
    const { createUpdateService } = require("./updateService");
    const service = createUpdateService({ app, getWindow: () => window });
    service.wireAutoUpdaterEvents();

    const getHandler = (eventName) => autoUpdater.on.mock.calls.find(([event]) => event === eventName)[1];
    getHandler("update-available")({ version: "0.2.0" });
    getHandler("update-downloaded")({ version: "0.2.0" });

    expect(window.webContents.send).toHaveBeenCalledWith("updates:state-changed", {
      status: "available",
      version: "0.2.0",
    });
    expect(window.webContents.send).toHaveBeenCalledWith("updates:state-changed", {
      status: "downloaded",
      version: "0.2.0",
    });
  });
});
