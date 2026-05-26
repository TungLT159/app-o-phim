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

  test("publishes desktop updates through GitHub Releases", () => {
    expect(packageJson.dependencies["electron-updater"]).toBeDefined();
    expect(packageJson.scripts["release:win"]).toBe("npm run electron:publish:win");
    expect(packageJson.scripts["electron:publish:win"]).toBe(
      "node scripts/check-gh-token.js && npm run prepare:electron-icon && npm run build && electron-builder --win nsis --publish always"
    );
    expect(packageJson.build.publish).toEqual({
      provider: "github",
      owner: "TungLT159",
      repo: "app-o-phim",
      releaseType: "release",
    });
    expect(packageJson.build.nsis.artifactName).toBe("O-Phim-Setup-${version}.${ext}");
    expect(packageJson.build.portable.artifactName).toBe("O-Phim-Portable-${version}.${ext}");
  });

  test("builds macOS dmg with the zip artifact required for auto updates", () => {
    expect(packageJson.scripts["electron:dist:mac"]).toBe(
      "npm run prepare:electron-icon && npm run build && npm run prepare:mac-build && electron-builder --mac dmg zip"
    );
    expect(packageJson.scripts["electron:publish:mac"]).toBe(
      "node scripts/check-gh-token.js && npm run prepare:electron-icon && npm run build && npm run prepare:mac-build && electron-builder --mac dmg zip --publish always"
    );
    expect(packageJson.scripts["prepare:mac-build"]).toBe("node scripts/clear-macos-xattrs.js");
    expect(packageJson.scripts["release:mac"]).toBe("npm run electron:publish:mac");

    const root = path.join(__dirname, "..");
    expect(fs.existsSync(path.join(root, "scripts", "clear-macos-xattrs.js"))).toBe(true);
    expect(fs.existsSync(path.join(root, "scripts", "check-gh-token.js"))).toBe(true);

    expect(packageJson.build.mac.target).toEqual(["dmg", "zip"]);
    expect(packageJson.build.mac.artifactName).toBe("O-Phim-Mac-${version}-${arch}.${ext}");
    expect(packageJson.build.mac.identity).toBeNull();
    expect(packageJson.build.dmg.artifactName).toBe("O-Phim-Mac-${version}-${arch}.${ext}");
    expect(packageJson.build.mac.icon).toBe("public/logo.png");
  });
});
