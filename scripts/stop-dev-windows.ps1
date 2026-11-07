[CmdletBinding(SupportsShouldProcess)]
param()

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$dependencyPrefix = (Join-Path $repositoryRoot 'node_modules') + '\'
$processes = @(Get-CimInstance Win32_Process)
$processesById = @{}
foreach ($entry in $processes) {
    $processesById[[int]$entry.ProcessId] = $entry
}

# Only select Turbo dev runs installed in this repository, never all Node processes.
$devProcesses = @($processes | Where-Object {
    $_.Name -eq 'turbo.exe' -and
    $_.ExecutablePath -and
    $_.ExecutablePath.StartsWith($dependencyPrefix, [StringComparison]::OrdinalIgnoreCase) -and
    $_.CommandLine -match '\brun\s+dev(?:\s|$)'
})

if ($devProcesses.Count -eq 0) {
    Write-Output 'No Turbo dev processes are running for this repository.'
    exit 0
}

foreach ($devProcess in $devProcesses) {
    $target = $devProcess
    $parent = $processesById[[int]$target.ParentProcessId]

    # Include Turbo's Node launcher and its task shell so a pending batch prompt cannot hang.
    if ($parent -and $parent.Name -eq 'node.exe' -and
        $parent.CommandLine -match [regex]::Escape($dependencyPrefix) -and
        $parent.CommandLine -match 'turbo[\\/]bin[\\/]turbo') {
        $target = $parent
        $parent = $processesById[[int]$target.ParentProcessId]
        if ($parent -and $parent.Name -eq 'cmd.exe' -and
            $parent.CommandLine -match '/c\s+"?turbo\s+run\s+dev(?:\s|"|$)') {
            $target = $parent
        }
    }

    if ($PSCmdlet.ShouldProcess(
        "PID $($target.ProcessId) ($($target.Name)), Turbo PID $($devProcess.ProcessId)",
        'Force-stop this repository''s Turbo dev process tree'
    )) {
        & taskkill.exe /PID $target.ProcessId /T /F
        if ($LASTEXITCODE -ne 0 -and
            (Get-Process -Id $target.ProcessId -ErrorAction SilentlyContinue)) {
            throw "Could not stop dev process PID $($target.ProcessId)."
        }
    }
}
