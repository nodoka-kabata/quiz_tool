@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo =====================================
echo CAIND QUIZ SYSTEM - Database Backup
echo =====================================
echo.

REM Create backup directory
if not exist "backups" mkdir backups

REM Generate timestamp for filename
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"
set "datestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

echo Creating backup: backups\quiz_tool_backup_%datestamp%.sql
C:\xampp\mysql\bin\mysqldump.exe -u root quiz_tool > backups\quiz_tool_backup_%datestamp%.sql

if errorlevel 1 (
    echo ERROR: Backup failed!
    pause
    exit /b 1
)

echo Backup completed successfully!
echo File: backups\quiz_tool_backup_%datestamp%.sql
echo.

REM Clean old backups (keep only 10 most recent)
cd backups
for /f "skip=10 delims=" %%f in ('dir /b /o-d quiz_tool_backup_*.sql 2^>nul') do (
    echo Removing old backup: %%f
    del "%%f"
)
cd ..

echo Backup maintenance completed.
pause
