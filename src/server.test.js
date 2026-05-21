/**
 * @jest-environment node
 */

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { startAppServer } = require("../server");

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
  });

  afterEach(async () => {
    if (appServer) {
      await appServer.close();
      appServer = null;
    }
    fs.rmSync(buildDir, { recursive: true, force: true });
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
});
