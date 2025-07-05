@echo off
chcp 65001 >nul 2>&1

echo =====================================
echo CAIND QUIZ SYSTEM - Environment Check
echo =====================================
echo.

set ERRORS=0

REM Check XAMPP installation
echo [1/6] Checking XAMPP installation...
if exist "C:\xampp\mysql\bin\mysql.exe" (
    echo ✓ MySQL found
) else (
    echo ✗ MySQL not found at C:\xampp\mysql\bin\mysql.exe
    set /a ERRORS+=1
)

if exist "C:\xampp\php\php.exe" (
    echo ✓ PHP found
) else (
    echo ✗ PHP not found at C:\xampp\php\php.exe
    set /a ERRORS+=1
)

REM Check MySQL service
echo.
echo [2/6] Checking MySQL service...
net start | find "MySQL" > nul 2>&1
if errorlevel 1 (
    echo ✗ MySQL service not running
    set /a ERRORS+=1
) else (
    echo ✓ MySQL service running
)

REM Check Apache service
echo.
echo [3/6] Checking Apache service...
net start | find "Apache" > nul 2>&1
if errorlevel 1 (
    echo ✗ Apache service not running
    set /a ERRORS+=1
) else (
    echo ✓ Apache service running
)

REM Check file structure
echo.
echo [4/6] Checking file structure...
if exist "sql\schema.sql" (
    echo ✓ Schema file exists
) else (
    echo ✗ sql\schema.sql not found
    set /a ERRORS+=1
)

if exist "api\db.php" (
    echo ✓ Database config exists
) else (
    echo ✗ api\db.php not found
    set /a ERRORS+=1
)

if exist "index.html" (
    echo ✓ Main page exists
) else (
    echo ✗ index.html not found
    set /a ERRORS+=1
)

REM Check database connection
echo.
echo [5/6] Checking database connection...
C:\xampp\mysql\bin\mysql.exe -u root -e "SELECT 1;" > nul 2>&1
if errorlevel 1 (
    echo ✗ Cannot connect to MySQL
    set /a ERRORS+=1
) else (
    echo ✓ MySQL connection successful
)

REM Check database and tables
echo.
echo [6/6] Checking database structure...
C:\xampp\mysql\bin\mysql.exe -u root -e "USE quiz_tool; SELECT 1;" > nul 2>&1
if errorlevel 1 (
    echo ✗ Database 'quiz_tool' not found
    set /a ERRORS+=1
) else (
    echo ✓ Database 'quiz_tool' exists
    
    REM Check tables
    C:\xampp\mysql\bin\mysql.exe -u root -e "USE quiz_tool; SHOW TABLES;" | findstr "users" > nul
    if errorlevel 1 (
        echo ✗ Table 'users' not found
        set /a ERRORS+=1
    ) else (
        echo ✓ Table 'users' exists
    )
    
    C:\xampp\mysql\bin\mysql.exe -u root -e "USE quiz_tool; SHOW TABLES;" | findstr "questions" > nul
    if errorlevel 1 (
        echo ✗ Table 'questions' not found
        set /a ERRORS+=1
    ) else (
        echo ✓ Table 'questions' exists
    )
)

echo.
echo =====================================
if %ERRORS% equ 0 (
    echo ✓ ALL CHECKS PASSED! System ready.
    echo.
    echo URLs to test:
    echo - Main page: http://localhost/quiz_tool/
    echo - Admin page: http://localhost/quiz_tool/admin.html
    echo - API test: http://localhost/quiz_tool/api/test.php
    echo - DB check: http://localhost/quiz_tool/api/db_check.php
) else (
    echo ✗ %ERRORS% ERROR(S) FOUND!
    echo.
    echo Please fix the errors above before using the system.
    if %ERRORS% gtr 3 (
        echo.
        echo Suggestion: Run setup_database.bat to initialize the database.
    )
)
echo =====================================
echo.
pause
