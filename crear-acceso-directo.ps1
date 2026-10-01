$rootGlobo = $PSScriptRoot
$nameGlobo = 'Globo Hist' + [char]0x00F3 + 'rico.lnk'
$pathGlobo = Join-Path ([Environment]::GetFolderPath('Desktop')) $nameGlobo
$shellGlobo = New-Object -ComObject WScript.Shell
$shortcutGlobo = $shellGlobo.CreateShortcut($pathGlobo)
$shortcutGlobo.TargetPath = Join-Path $env:SystemRoot 'System32/WindowsPowerShell/v1.0/powershell.exe'
$shortcutGlobo.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $rootGlobo 'servidor-local.ps1') + '"'
$shortcutGlobo.WorkingDirectory = $rootGlobo
$shortcutGlobo.IconLocation = (Join-Path $rootGlobo 'globo.ico') + ',0'
$shortcutGlobo.Description = 'Globo Historico: relieve y voz local'
$shortcutGlobo.WindowStyle = 7
$shortcutGlobo.Save()
Write-Output 'Acceso directo del escritorio actualizado.'
