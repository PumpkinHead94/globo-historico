. (Join-Path $PSScriptRoot 'instancia-local.ps1')
$portGlobo = Get-GloboPort
if ($portGlobo) {
    try { Invoke-WebRequest -UseBasicParsing -Method Post -Headers @{'X-Globo-Local'='1'} -Uri "http://127.0.0.1:$portGlobo/_stop" -TimeoutSec 3 | Out-Null } catch {}
}
