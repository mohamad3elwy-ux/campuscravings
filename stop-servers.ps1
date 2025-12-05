# PowerShell script to stop all Node.js processes using ports 5000 and 3000

Write-Host "Stopping servers on ports 5000 and 3000..." -ForegroundColor Yellow

# Stop processes on port 5000
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $processId = $port5000.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $processId -Force
        Write-Host "Stopped process $processId (port 5000) - $($process.ProcessName)" -ForegroundColor Green
    }
} else {
    Write-Host "No process found on port 5000" -ForegroundColor Gray
}

# Stop processes on port 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $processId = $port3000.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $processId -Force
        Write-Host "Stopped process $processId (port 3000) - $($process.ProcessName)" -ForegroundColor Green
    }
} else {
    Write-Host "No process found on port 3000" -ForegroundColor Gray
}

Write-Host "Done!" -ForegroundColor Green

