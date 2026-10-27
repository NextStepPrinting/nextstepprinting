# Temporary convenience for this Windows checkout, where Node is not on PATH.
# Uses the Node runtime shipped with VS Code. Install Node 22+ for npm commands.
param([ValidateSet('dev','build','check','test')][string]$Task='dev')
$ErrorActionPreference='Stop'
$runtime=Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code\Code.exe'
if(!(Test-Path -LiteralPath $runtime)){throw 'Install Node.js 22+ and use the npm commands in README.md.'}
$previous=$env:ELECTRON_RUN_AS_NODE
try {
  $env:ELECTRON_RUN_AS_NODE='1'
  switch($Task){
    'dev' { & $runtime scripts/serve.mjs | Out-Host }
    'build' { & $runtime scripts/build.mjs | Out-Host }
    'check' { & $runtime scripts/check.mjs | Out-Host }
    'test' { & $runtime --test tests/quote.test.mjs | Out-Host }
  }
  if($LASTEXITCODE -ne 0){throw "Task failed with exit code $LASTEXITCODE"}
} finally { $env:ELECTRON_RUN_AS_NODE=$previous }
