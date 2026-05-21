/**
 * @jest-environment node
 */

const fs = require("fs");
const path = require("path");
const packageJson = require("../package.json");

describe("Electron packaging icon configuration", () => {
  test("uses the logo icon for installed Windows app shortcuts", () => {
    const root = path.join(__dirname, "..");

    expect(packageJson.scripts["prepare:electron-icon"]).toBe("node scripts/generate-electron-icon.js");
    expect(packageJson.build.win.icon).toBe("public/logo.png");
    expect(packageJson.build.afterPack).toBe("scripts/set-electron-icon.js");
    expect(packageJson.build.win.signAndEditExecutable).toBe(false);

    expect(fs.existsSync(path.join(root, "scripts", "generate-electron-icon.js"))).toBe(true);
    expect(fs.existsSync(path.join(root, "scripts", "set-electron-icon.js"))).toBe(true);
  });
});
