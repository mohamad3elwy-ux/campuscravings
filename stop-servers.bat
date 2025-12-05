@echo off
echo Stopping servers on ports 5000 and 3000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Stopping process %%a on port 5000...
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Stopping process %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)

echo Done!
pause

