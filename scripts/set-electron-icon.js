const path = require("path");
const rceditModule = require("rcedit");

const rcedit = rceditModule.rcedit || rceditModule.default || rceditModule;

module.exports = async function setElectronIcon(context) {
  if (context.electronPlatformName !== "win32") return;

  const iconPath = path.join(context.packager.projectDir, "public", "logo.ico");
  const executableName = `${context.packager.appInfo.productFilename}.exe`;
  const executablePath = path.join(context.appOutDir, executableName);

  await rcedit(executablePath, {
    icon: iconPath,
  });
};
