# O Phim NSIS Installer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `test.nsi` so it installs and launches the O Phim desktop app using `O Phim 0.1.0.exe`.

**Architecture:** Keep a standalone NSIS script in `dist-electron-installed-icon/test.nsi`. The script packages the portable Electron executable from the same folder, installs it to `C:\OPhim`, creates shortcuts, writes an uninstaller, and launches the app after install.

**Tech Stack:** NSIS MUI2, Windows shortcuts, Electron portable executable.

---

## File Structure

- Modify: `dist-electron-installed-icon/test.nsi` - standalone O Phim NSIS installer script.
- No tests created: this is a generated installer script outside the React test harness. Verification is by static inspection and optional `makensis` compilation if available.

### Task 1: Rewrite NSIS Script

**Files:**
- Modify: `dist-electron-installed-icon/test.nsi`

- [ ] **Step 1: Replace the script content**

Replace the full file with:

```nsi
; =====================================================
; NSIS SCRIPT - O PHIM INSTALLER
; =====================================================

Unicode true
ManifestDPIAware true

!include "MUI2.nsh"

!define MUI_FONT "Segoe UI"
!define MUI_FONT_SIZE 9

; =====================================================
; THONG TIN UNG DUNG
; =====================================================
!define APP_NAME "O Phim"
!define APP_SHORT_NAME "OPhim"
!define APP_VERSION "0.1.0"
!define APP_PUBLISHER "O Phim"
!define APP_URL "https://ophim.tv/"
!define APP_EXE "O Phim 0.1.0.exe"

!define INSTALL_DIR "C:\${APP_SHORT_NAME}"

; =====================================================
; SETUP
; =====================================================
Name "${APP_NAME}"
OutFile "O Phim Custom Setup ${APP_VERSION}.exe"
InstallDir "${INSTALL_DIR}"
RequestExecutionLevel admin

BrandingText "${APP_NAME}"

VIProductVersion "0.1.0.0"
VIAddVersionKey "ProductName" "${APP_NAME}"
VIAddVersionKey "CompanyName" "${APP_PUBLISHER}"
VIAddVersionKey "ProductVersion" "${APP_VERSION}"
VIAddVersionKey "FileDescription" "${APP_NAME} Installer"

; =====================================================
; CAC TRANG
; =====================================================
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "Vietnamese"

; =====================================================
; CAI DAT
; =====================================================
Section "Install"
    SetOutPath "$INSTDIR"
    File "O Phim 0.1.0.exe"

    CreateDirectory "$SMPROGRAMS\${APP_NAME}"
    CreateShortcut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}"
    CreateShortcut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}"

    WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

; =====================================================
; CHAY SAU KHI CAI
; =====================================================
Section -PostInstall
    Exec '"$INSTDIR\${APP_EXE}"'
SectionEnd

; =====================================================
; GO CAI DAT
; =====================================================
Section "Uninstall"
    Delete "$DESKTOP\${APP_NAME}.lnk"
    Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
    RMDir "$SMPROGRAMS\${APP_NAME}"

    Delete "$INSTDIR\${APP_EXE}"
    Delete "$INSTDIR\Uninstall.exe"
    RMDir "$INSTDIR"
SectionEnd
```

- [ ] **Step 2: Verify old dependencies are gone**

Run: `rg "IIT|3D|build3d|Downloads|sidebar|header|license|\.myp|songam|iiticon" dist-electron-installed-icon/test.nsi`

Expected: no matches.

- [ ] **Step 3: Verify the app executable is referenced**

Run: `rg "O Phim 0\.1\.0\.exe|APP_NAME|CreateShortcut|Exec" dist-electron-installed-icon/test.nsi`

Expected: matches show the executable definition, shortcut creation, and post-install launch.

- [ ] **Step 4: Optionally compile if NSIS is available**

Run: `makensis dist-electron-installed-icon/test.nsi`

Expected if NSIS exists: installer compiles successfully.

Expected if NSIS is not in PATH: command is not found; static verification remains the fallback.
