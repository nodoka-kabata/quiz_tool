@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo =====================================
echo CAIND QUIZ SYSTEM - Database Setup
echo =====================================
echo.

REM XAMPP installation check
if not exist "C:\xampp\mysql\bin\mysql.exe" (
    echo ERROR: XAMPP MySQL not found at C:\xampp\mysql\bin\mysql.exe
    echo Please install XAMPP or adjust the path.
    echo.
    pause
    exit /b 1
)

REM Check if current directory is correct
if not exist "sql\schema.sql" (
    echo ERROR: schema.sql not found in sql directory.
    echo Please run this script from the quiz_tool root directory.
    echo Current directory: %CD%
    echo.
    pause
    exit /b 1
)

REM Check MySQL service
echo Checking MySQL service...
net start | find "MySQL" > nul 2>&1
if errorlevel 1 (
    echo ERROR: MySQL service is not running.
    echo Please start MySQL in XAMPP Control Panel.
    echo.
    pause
    exit /b 1
)
echo MySQL service is running. ✓

REM Test MySQL connection
echo Testing MySQL connection...
C:\xampp\mysql\bin\mysql.exe -u root -e "SELECT 1;" > nul 2>&1
if errorlevel 1 (
    echo ERROR: Cannot connect to MySQL.
    echo Please check if MySQL is properly configured.
    echo.
    pause
    exit /b 1
)
echo MySQL connection successful. ✓

REM Create database
echo.
echo Creating database 'quiz_tool'...
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS quiz_tool CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>db_error.log
if errorlevel 1 (
    echo ERROR: Failed to create database.
    echo Error details:
    type db_error.log
    del db_error.log
    pause
    exit /b 1
)
echo Database created successfully. ✓

REM Import schema
echo.
echo Importing schema from sql\schema.sql...
C:\xampp\mysql\bin\mysql.exe -u root quiz_tool < sql\schema.sql 2>schema_error.log
if errorlevel 1 (
    echo ERROR: Failed to import schema.
    echo Error details:
    type schema_error.log
    del schema_error.log
    pause
    exit /b 1
)
echo Schema imported successfully. ✓

REM Verify tables
echo.
echo Verifying database structure...
C:\xampp\mysql\bin\mysql.exe -u root -e "USE quiz_tool; SHOW TABLES;" > table_list.tmp 2>&1
if errorlevel 1 (
    echo ERROR: Cannot verify database structure.
    del table_list.tmp
    pause
    exit /b 1
)

findstr /C:"answers" table_list.tmp > nul && (
    set TABLE_ANSWERS=✓
) || (
    set TABLE_ANSWERS=✗
    set VERIFICATION_FAILED=1
)

findstr /C:"questions" table_list.tmp > nul && (
    set TABLE_QUESTIONS=✓
) || (
    set TABLE_QUESTIONS=✗
    set VERIFICATION_FAILED=1
)

findstr /C:"quiz_state" table_list.tmp > nul && (
    set TABLE_QUIZ_STATE=✓
) || (
    set TABLE_QUIZ_STATE=✗
    set VERIFICATION_FAILED=1
)

findstr /C:"users" table_list.tmp > nul && (
    set TABLE_USERS=✓
) || (
    set TABLE_USERS=✗
    set VERIFICATION_FAILED=1
)

del table_list.tmp

echo Tables verification:
echo   - users: !TABLE_USERS!
echo   - questions: !TABLE_QUESTIONS!
echo   - answers: !TABLE_ANSWERS!
echo   - quiz_state: !TABLE_QUIZ_STATE!

if defined VERIFICATION_FAILED (
    echo.
    echo ERROR: Some tables are missing. Please check the schema.sql file.
    pause
    exit /b 1
)

REM Clean up temporary files
if exist db_error.log del db_error.log
if exist schema_error.log del schema_error.log

echo.
echo =====================================
echo    DATABASE SETUP COMPLETED! ✓
echo =====================================
echo.
echo Next steps:
echo 1. Verify: http://localhost/quiz_tool/api/db_check.php
echo 2. Test: http://localhost/quiz_tool/api/test.php
echo 3. Start using: http://localhost/quiz_tool/
echo.
pause
