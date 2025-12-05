# Port Conflict Guide

## The Problem

When you run the same application in multiple compilers/IDEs/terminals, they all try to use the same ports:
- **Port 5000**: Backend server
- **Port 3000**: Frontend React app

Only one process can use a port at a time, so you'll get errors like:
```
Error: listen EADDRINUSE: address already in use :::5000
```

## Solutions

### Solution 1: Stop Other Instances (Recommended)

**Before starting the app, stop any running instances:**

#### Option A: Use the stop script
```bash
npm run stop
```

Or on Windows:
```bash
npm run stop-bat
```

#### Option B: Manual PowerShell command
```powershell
# Stop port 5000
Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Stop port 3000
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

#### Option C: Use the clean dev command
```bash
npm run dev-clean
```
This automatically stops servers and then starts them again.

### Solution 2: Use Different Ports for Each Instance

If you need to run multiple instances simultaneously, use different ports:

#### For Instance 1 (Default):
- Backend: Port 5000
- Frontend: Port 3000

#### For Instance 2:
1. Create a new `.env` file or modify the existing one:
   ```env
   PORT=5001
   REACT_APP_API_URL=http://localhost:5001
   ```

2. Update `frontend/package.json` to use a different port:
   ```json
   "scripts": {
     "start": "set PORT=3001 && react-scripts start"
   }
   ```

3. Update `frontend/src` files to use the new API URL if needed.

### Solution 3: Check What's Using the Ports

To see what processes are using the ports:

```powershell
# Check port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess | ForEach-Object { Get-Process -Id $_.OwningProcess }

# Check port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess | ForEach-Object { Get-Process -Id $_.OwningProcess }
```

Or using netstat:
```bash
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

## Quick Fix Commands

### Stop all Node processes (be careful - stops ALL Node.js processes):
```powershell
Get-Process node | Stop-Process -Force
```

### Stop only processes on specific ports:
```powershell
npm run stop
```

## Best Practice

**Always stop the previous instance before starting a new one:**
1. Press `Ctrl+C` in the terminal where the app is running
2. Or use `npm run stop` to kill processes on ports 5000 and 3000
3. Then start fresh with `npm run dev`

## Why This Happens

- Each compiler/IDE/terminal runs the app independently
- They all try to bind to the same ports
- Operating systems don't allow multiple processes on the same port
- This is normal behavior - it's a feature, not a bug!

