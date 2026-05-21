/**
 * @jest-environment node
 */

describe("watch history preload bridge", () => {
  let exposed;
  let ipcRenderer;

  beforeEach(() => {
    jest.resetModules();
    exposed = undefined;
    ipcRenderer = { invoke: jest.fn().mockResolvedValue(undefined) };

    jest.doMock("electron", () => ({
      contextBridge: {
        exposeInMainWorld: jest.fn((name, api) => {
          exposed = { name, api };
        }),
      },
      ipcRenderer,
    }));
  });

  afterEach(() => {
    jest.dontMock("electron");
  });

  test("exposes watch history storage methods through ipc", async () => {
    require("./preload");

    expect(exposed.name).toBe("ophimWatchHistoryStorage");

    await exposed.api.read();
    await exposed.api.write([{ key: "movie-1" }]);
    await exposed.api.clear();

    expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(1, "watch-history:read");
    expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(2, "watch-history:write", [{ key: "movie-1" }]);
    expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(3, "watch-history:clear");
  });
});
