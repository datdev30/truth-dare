# Builds build/truth-dare.apk with the Android SDK tools only (no Gradle).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
$tools = "$sdk\build-tools\36.1.0"
$jar = "$sdk\platforms\android-36\android.jar"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$keystore = "$env:USERPROFILE\.android\debug.keystore"

function Run($exe) {
  $flat = $args | ForEach-Object { $_ }
  & $exe @flat
  if ($LASTEXITCODE) { throw "$exe failed" }
}

Remove-Item build -Recurse -Force -ErrorAction SilentlyContinue
New-Item build\classes -ItemType Directory | Out-Null

Run "$tools\aapt2.exe" compile --dir res -o build\res.zip
Run "$tools\aapt2.exe" link -o build\base.apk -I $jar --manifest AndroidManifest.xml build\res.zip `
  --min-sdk-version 26 --target-sdk-version 34 --version-code 1 --version-name 1.0
Run javac --release 11 -classpath $jar -d build\classes (Get-ChildItem src -Recurse -Filter *.java).FullName
Run "$tools\d8.bat" --release --min-api 26 --lib $jar --output build (Get-ChildItem build\classes -Recurse -Filter *.class).FullName
Run jar -u -M -f build\base.apk -C build classes.dex
Run "$tools\zipalign.exe" -f -p 4 build\base.apk build\aligned.apk
# ponytail: signed with the debug key, fine for sideloading; use a release keystore before publishing to Play
Run "$tools\apksigner.bat" sign --ks $keystore --ks-pass pass:android --out build\truth-dare.apk build\aligned.apk

Write-Host "APK: $PSScriptRoot\build\truth-dare.apk"
