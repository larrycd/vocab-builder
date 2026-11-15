; Vocab Builder - Windows setup (per-user, no administrator rights)
Unicode true
SetCompressor /SOLID lzma
!include "MUI2.nsh"
!include "x64.nsh"
!include "LogicLib.nsh"
!define APPNAME "Vocab Builder"
!define VERSION "1.2.0"
!define PUBLISHER "Larry Dalton"
!define UNINSTKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\VocabBuilder"
Name "${APPNAME}"
OutFile "VocabBuilder-Setup.exe"
RequestExecutionLevel user
InstallDir "$LOCALAPPDATA\VocabBuilder-Setup"
BrandingText "Vocab Builder - by Larry Dalton"
VIProductVersion "1.2.0.0"
VIAddVersionKey "ProductName" "${APPNAME}"
VIAddVersionKey "CompanyName" "${PUBLISHER}"
VIAddVersionKey "FileDescription" "Vocab Builder setup"
VIAddVersionKey "FileVersion" "${VERSION}"
VIAddVersionKey "ProductVersion" "${VERSION}"
VIAddVersionKey "LegalCopyright" "Vocab Builder by Larry Dalton"
!define MUI_ICON "vocab.ico"
!define MUI_UNICON "vocab.ico"
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "Vocab Builder ${VERSION}"
!define MUI_WELCOMEPAGE_TEXT "Learn and test vocabulary: 21 decks - English (Old, Middle, lost and modern), Bible languages and theology, borrowed words and roots, and Modern Hebrew, Spanish, Russian, Mandarin and Japanese - by Larry Dalton.$\r$\n$\r$\nThis will:$\r$\n  - install Vocab Builder for your Windows account (no administrator rights needed)$\r$\n  - start it at sign-in and open it at http://localhost:8773/$\r$\n  - place the Vocab Builder infographic on your Desktop$\r$\n$\r$\nA PowerShell window shows the install checks. If any check fails, your previous version is restored automatically."
!define MUI_FINISHPAGE_TITLE "Vocab Builder is installed"
!define MUI_FINISHPAGE_TEXT "Vocab Builder is running at http://localhost:8773/ and starts automatically when you sign in.$\r$\n$\r$\nYour progress is kept in Documents\vocab-builder.$\r$\n$\r$\nThe infographic is on your Desktop:$\r$\n  Vocab Builder - How It Works.png"
!define MUI_FINISHPAGE_LINK "Open Vocab Builder"
!define MUI_FINISHPAGE_LINK_LOCATION "http://localhost:8773/"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"
Var PS
Var RES
Function .onInit
  SetShellVarContext current
FunctionEnd
Function un.onInit
  SetShellVarContext current
FunctionEnd
Section "Install"
  SetShellVarContext current
  ${If} ${RunningX64}
    ${DisableX64FSRedirection}
  ${EndIf}
  StrCpy $PS "$WINDIR\System32\WindowsPowerShell\v1.0\powershell.exe"
  IfFileExists "$PS" +3 0
    MessageBox MB_ICONSTOP "Windows PowerShell was not found ($PS). Vocab Builder needs Windows PowerShell 5.1."
    Abort "Windows PowerShell not found."
  SetOutPath "$INSTDIR"
  File "Install.ps1"
  File "Uninstall.ps1"
  File "vocab.ico"
  RMDir /r "$INSTDIR\payload"
  SetOutPath "$INSTDIR\payload"
  File /r "payload\*"
  DetailPrint "Placing the infographic on your Desktop..."
  SetOutPath "$DESKTOP"
  File "Vocab Builder - How It Works.png"
  SetOutPath "$INSTDIR"
  DetailPrint "Installing and verifying Vocab Builder (see the PowerShell window)..."
  Delete "$TEMP\VocabBuilder-install-result.txt"
  ExecWait '"$PS" -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\Install.ps1" -Source "$INSTDIR\payload"'
  StrCpy $RES ""
  ClearErrors
  FileOpen $0 "$TEMP\VocabBuilder-install-result.txt" r
  ${IfNot} ${Errors}
    FileRead $0 $RES
    FileClose $0
  ${EndIf}
  StrCpy $1 $RES 2
  ${If} $1 != "OK"
    ${If} $RES == ""
      StrCpy $RES "The PowerShell install did not report a result."
    ${EndIf}
    DetailPrint "Install failed: $RES"
    MessageBox MB_ICONSTOP "Vocab Builder was not installed.$\r$\n$\r$\n$RES$\r$\n$\r$\nYour previous version (if any) has been restored."
    Abort "Vocab Builder was not installed."
  ${EndIf}
  RMDir /r "$INSTDIR\payload"
  DetailPrint "Install verified."
  WriteINIStr "$SMPROGRAMS\Vocab Builder.url" "InternetShortcut" "URL" "http://localhost:8773/"
  WriteINIStr "$SMPROGRAMS\Vocab Builder.url" "InternetShortcut" "IconFile" "$INSTDIR\vocab.ico"
  WriteINIStr "$SMPROGRAMS\Vocab Builder.url" "InternetShortcut" "IconIndex" "0"
  WriteINIStr "$DESKTOP\Vocab Builder.url" "InternetShortcut" "URL" "http://localhost:8773/"
  WriteINIStr "$DESKTOP\Vocab Builder.url" "InternetShortcut" "IconFile" "$INSTDIR\vocab.ico"
  WriteINIStr "$DESKTOP\Vocab Builder.url" "InternetShortcut" "IconIndex" "0"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayName" "${APPNAME}"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNINSTKEY}" "Publisher" "${PUBLISHER}"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayIcon" "$INSTDIR\vocab.ico"
  WriteRegStr HKCU "${UNINSTKEY}" "InstallLocation" "$LOCALAPPDATA\VocabBuilder"
  WriteRegStr HKCU "${UNINSTKEY}" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr HKCU "${UNINSTKEY}" "URLInfoAbout" "http://localhost:8773/"
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoRepair" 1
SectionEnd
Section "Uninstall"
  SetShellVarContext current
  ${If} ${RunningX64}
    ${DisableX64FSRedirection}
  ${EndIf}
  ExecWait '"$WINDIR\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "$INSTDIR\Uninstall.ps1"'
  Delete "$SMPROGRAMS\Vocab Builder.url"
  Delete "$DESKTOP\Vocab Builder.url"
  DeleteRegKey HKCU "${UNINSTKEY}"
  Delete "$INSTDIR\Install.ps1"
  Delete "$INSTDIR\Uninstall.ps1"
  Delete "$INSTDIR\vocab.ico"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
  MessageBox MB_ICONINFORMATION "Vocab Builder has been removed.$\r$\nYour progress in Documents\vocab-builder, the infographic on your Desktop and earlier backups (VocabBuilder-backup-*) were left in place."
SectionEnd
