/**
 * @jest-environment node
 */

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

jest.mock("child_process", () => ({
  spawn: jest.fn(() => {
    const { EventEmitter } = require("events");
    return {
      stderr: new EventEmitter(),
      on: jest.fn(),
      kill: jest.fn(),
    };
  }),
}));

const { resolveFfmpegPath, startAppServer } = require("../server");

function request(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        });
      })
      .on("error", reject);
  });
}

describe("startAppServer", () => {
  let buildDir;
  let appServer;

  beforeEach(() => {
    buildDir = fs.mkdtempSync(path.join(os.tmpdir(), "ophim-build-"));
    fs.writeFileSync(path.join(buildDir, "index.html"), "<html><body>desktop shell</body></html>");
    global.fetch = jest.fn();
  });

  afterEach(async () => {
    if (appServer) {
      await appServer.close();
      appServer = null;
    }
    fs.rmSync(buildDir, { recursive: true, force: true });
    delete global.fetch;
    jest.clearAllMocks();
  });

  test("starts on an available local port and serves the React shell", async () => {
    appServer = await startAppServer({ buildDir, port: 0 });

    expect(appServer.port).toBeGreaterThan(0);
    expect(appServer.url).toBe(`http://127.0.0.1:${appServer.port}`);

    const response = await request(`${appServer.url}/`);

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.body).toContain("desktop shell");
  });

  test("falls back to index.html for SPA routes", async () => {
    appServer = await startAppServer({ buildDir, port: 0 });

    const response = await request(`${appServer.url}/movie/cuoc-chien-sinh-tu-ii`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("desktop shell");
  });

  test("starts a download job with the bundled ffmpeg binary", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            item: {
              name: "Test Movie",
              episodes: [
                {
                  server_data: [
                    {
                      name: "1",
                      slug: "tap-1",
                      link_m3u8: "https://cdn.example/movie/master.m3u8",
                    },
                  ],
                },
              ],
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "#EXTM3U\n#EXT-X-TARGETDURATION:10\nsegment.ts\n",
      });
    appServer = await startAppServer({ buildDir, port: 0 });

    const response = await request(
      `${appServer.url}/api/download/start?slug=test-movie&ep=tap-1&quality=720p`,
    );
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(202);
    expect(body).toMatchObject({
      status: "processing",
      progress: 0,
      message: "Đang chuyển mã sang MP4 tương thích...",
    });
    expect(body.jobId).toEqual(expect.any(String));
  });

  test("resolves ffmpeg from app.asar.unpacked in packaged Electron apps", () => {
    const asarPath = path.join(
      "C:",
      "Program Files",
      "O Phim",
      "resources",
      "app.asar",
      "node_modules",
      "@ffmpeg-installer",
      "win32-x64",
      "ffmpeg.exe",
    );

    expect(resolveFfmpegPath(asarPath)).toBe(
      asarPath.replace(`${path.sep}app.asar${path.sep}`, `${path.sep}app.asar.unpacked${path.sep}`),
    );
  });
});
