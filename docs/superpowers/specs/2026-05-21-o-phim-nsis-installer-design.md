# O Phim NSIS Installer Design

## Goal

Update `dist-electron-installed-icon/test.nsi` so it installs and launches the O Phim desktop app using `O Phim 0.1.0.exe`.

## Scope

- Replace the old IIT/3D app metadata with O Phim metadata.
- Remove hard-coded dependencies on old paths such as `D:\build3d_2026` and `C:\Users\thanh\Downloads`.
- Package the existing portable executable `O Phim 0.1.0.exe` from the same folder as `test.nsi`.
- Create Start Menu and Desktop shortcuts that launch the installed executable.
- Launch the app after installation.
- Keep uninstall behavior simple: remove shortcuts, the uninstaller, and the installed app folder.

## Decisions

- Do not include custom sidebar, header, icon, or license files so the script can compile without external assets.
- Do not register custom file extensions because this is a movie viewing app and no file association was requested.
- Use a per-machine-style install location under `C:\OPhim` to match the existing admin installer style.

## Verification

- Inspect `test.nsi` to ensure it references `O Phim 0.1.0.exe` and no old app paths remain.
- Optionally compile with NSIS if `makensis` is available in the environment.
