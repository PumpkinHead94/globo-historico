# Estado por carpeta, compartido por el iniciador y el apagado. Compatible con PS 5.1.
$rootGlobo = [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd([IO.Path]::DirectorySeparatorChar)
$hashGlobo = [Security.Cryptography.SHA256]::Create()
try { $keyGlobo = ([BitConverter]::ToString($hashGlobo.ComputeHash([Text.Encoding]::UTF8.GetBytes($rootGlobo.ToLowerInvariant())))).Replace('-', '') } finally { $hashGlobo.Dispose() }
$stateDirectoryGlobo = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'GloboHistorico'
$stateFileGlobo = Join-Path $stateDirectoryGlobo ($keyGlobo + '.json')
function Get-GloboPort {
    $portsGlobo = @(8765)
    if (Test-Path -LiteralPath $stateFileGlobo) {
        try { $savedGlobo = Get-Content -LiteralPath $stateFileGlobo -Raw | ConvertFrom-Json; $portsGlobo = @([int]$savedGlobo.port, 8765) } catch {}
    }
    foreach ($portGlobo in ($portsGlobo | Select-Object -Unique)) {
        if ($portGlobo -lt 1024 -or $portGlobo -gt 65535) { continue }
        try {
            $requestGlobo = [Net.HttpWebRequest]::Create("http://127.0.0.1:$portGlobo/_status")
            $requestGlobo.Proxy = $null; $requestGlobo.Timeout = 900; $requestGlobo.ReadWriteTimeout = 900
            $responseGlobo = $requestGlobo.GetResponse()
            try {
                $readerGlobo = New-Object IO.StreamReader($responseGlobo.GetResponseStream())
                try { $bodyGlobo = $readerGlobo.ReadToEnd() } finally { $readerGlobo.Dispose() }
            } finally { $responseGlobo.Dispose() }
            if ($bodyGlobo -match '^GloboHistorico-(?:v0\.2|local)\|(.+)$' -and $Matches[1] -eq $rootGlobo) { return $portGlobo }
        } catch {}
    }
    return $null
}
