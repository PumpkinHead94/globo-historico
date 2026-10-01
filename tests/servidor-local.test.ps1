$ErrorActionPreference='Stop'
$sourceTestGlobo=Split-Path $PSScriptRoot -Parent
$testBaseGlobo=Join-Path ([IO.Path]::GetTempPath()) ('Globo-prueba-'+[Guid]::NewGuid().ToString('N'))
$testDirsGlobo=@((Join-Path $testBaseGlobo 'copia uno'),(Join-Path $testBaseGlobo 'copia dos'))
$testProcessesGlobo=@()
function Start-TestGlobo($directory){
    Start-Process powershell.exe -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',('"'+(Join-Path $directory 'servidor-local.ps1')+'"'),'-NoBrowser') -WindowStyle Hidden -PassThru
}
function Wait-TestGlobo($directory){
    . (Join-Path $directory 'instancia-local.ps1')
    $deadlineTestGlobo=[DateTime]::UtcNow.AddSeconds(20)
    while([DateTime]::UtcNow -lt $deadlineTestGlobo){
        $foundTestGlobo=Get-GloboPort
        if($foundTestGlobo){return $foundTestGlobo}
        Start-Sleep -Milliseconds 150
    }
    throw 'No se inicio la copia de prueba.'
}
try {
    foreach($directoryTestGlobo in $testDirsGlobo){
        New-Item -ItemType Directory -Path $directoryTestGlobo -Force | Out-Null
        foreach($nameTestGlobo in @('servidor-local.ps1','instancia-local.ps1','detener-servidor.ps1')){
            Copy-Item -LiteralPath (Join-Path $sourceTestGlobo $nameTestGlobo) -Destination $directoryTestGlobo
        }
        Set-Content -LiteralPath (Join-Path $directoryTestGlobo 'index.html') -Value 'Globo test'
    }
    $testProcessesGlobo+=Start-TestGlobo $testDirsGlobo[0]
    $testProcessesGlobo+=Start-TestGlobo $testDirsGlobo[0]
    $testProcessesGlobo+=Start-TestGlobo $testDirsGlobo[1]
    $firstTestGlobo=Wait-TestGlobo $testDirsGlobo[0]
    $secondTestGlobo=Wait-TestGlobo $testDirsGlobo[1]
    if($firstTestGlobo -eq $secondTestGlobo){throw 'Dos carpetas compartieron una instancia incorrectamente.'}
    foreach($portTestGlobo in @($firstTestGlobo,$secondTestGlobo)){
        $pageTestGlobo=Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$portTestGlobo/" -TimeoutSec 3
        if($pageTestGlobo.Content.Trim() -ne 'Globo test'){throw 'La instancia sirvio otra carpeta.'}
    }
    $repeatTestGlobo=Start-TestGlobo $testDirsGlobo[0]
    $testProcessesGlobo+=$repeatTestGlobo
    if(-not $repeatTestGlobo.WaitForExit(10000)){throw 'Una reapertura creo otro servidor.'}
    if($repeatTestGlobo.ExitCode -ne 0){throw 'La reapertura fallo.'}
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $testDirsGlobo[0] 'detener-servidor.ps1')
    $stillRunningTestGlobo=Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$secondTestGlobo/" -TimeoutSec 3
    if($stillRunningTestGlobo.StatusCode -ne 200){throw 'Se apago la copia equivocada.'}
    Start-Sleep -Milliseconds 250
    $testProcessesGlobo+=Start-TestGlobo $testDirsGlobo[0]
    $restartedTestGlobo=Wait-TestGlobo $testDirsGlobo[0]
    Write-Output "PASS: carpetas simultaneas, doble inicio, reapertura, apagado independiente y reinicio con estado anterior. Puertos $firstTestGlobo / $secondTestGlobo / $restartedTestGlobo."
} finally {
    foreach($directoryTestGlobo in $testDirsGlobo){
        if(Test-Path -LiteralPath (Join-Path $directoryTestGlobo 'detener-servidor.ps1')){
            & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $directoryTestGlobo 'detener-servidor.ps1')
        }
    }
}
