@echo off
title NutriVision AI — Master Backend Launcher
color 0A

echo =====================================================================
echo   🚀 NUTRIVISION AI — STARTING ALL BACKEND SUBSYSTEMS
echo =====================================================================
echo.

cd /d "%~dp0"

:: 1. Check & Start MySQL (Laragon detection)
echo [1/3] Memeriksa Database MySQL di Port 3306...
netstat -ano | findstr ":3306" >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] MySQL belum aktif, mencoba mengaktifkan via Laragon mysqld...
    if exist "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqld.exe" (
        start /B "" "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqld.exe" --defaults-file="C:\laragon\bin\mysql\mysql-8.0.30-winx64\my.ini"
        timeout /t 3 /nobreak >nul
    ) else if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start /B "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini"
        timeout /t 3 /nobreak >nul
    ) else (
        echo [!] Perhatian: Pastikan MySQL aktif di port 3306 melalui Laragon/XAMPP.
    )
) else (
    echo [OK] MySQL Service aktif di port 3306.
)

:: 2. Start Python AI Inference Service
echo.
echo [2/3] Mengaktifkan Python AI Inference Engine (.safetensors)...
netstat -ano | findstr ":5050" >nul 2>&1
if %errorlevel% neq 0 (
    start "NutriVision Python AI (Port 5050)" cmd /k "python server/ai_service.py 5050"
    timeout /t 2 /nobreak >nul
) else (
    echo [OK] Python AI Service sudah aktif di port 5050.
)

:: 3. Start Node.js Express REST API Server
echo.
echo [3/3] Mengaktifkan Node.js Express REST API Server (Port 5000)...
netstat -ano | findstr ":5000" >nul 2>&1
if %errorlevel% neq 0 (
    start "NutriVision Node.js API (Port 5000)" cmd /k "node server/server.js"
    timeout /t 2 /nobreak >nul
) else (
    echo [OK] Node.js REST API sudah aktif di port 5000.
)

echo.
echo =====================================================================
echo  🩺 MENJALANKAN AUDIT & DIAGNOSTIK OTOMATIS SISTEM...
echo =====================================================================
echo.
node server/verify_system.js

echo.
echo [INFO] Buka http://localhost:5000 di browser untuk mengakses web app.
echo Tekan tombol apa saja untuk menutup jendela peluncur ini.
pause >nul
