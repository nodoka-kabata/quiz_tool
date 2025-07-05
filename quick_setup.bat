@echo off
echo Creating quiz_tool database...
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS quiz_tool CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo Importing schema...
C:\xampp\mysql\bin\mysql.exe -u root quiz_tool < sql\schema.sql

echo Done! Check: http://localhost/quiz_tool/api/db_check.php
pause
