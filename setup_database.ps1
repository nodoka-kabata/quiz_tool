# PowerShell Database Setup Script
Write-Host "Setting up quiz_tool database..." -ForegroundColor Green

# Check if MySQL service is running
$mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
if (-not $mysqlService -or $mysqlService.Status -ne "Running") {
    Write-Host "MySQL service not found or not running. Please start MySQL in XAMPP." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create database
Write-Host "Creating database..." -ForegroundColor Yellow
try {
    & "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS quiz_tool CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    Write-Host "Database created successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to create database: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Import schema
Write-Host "Importing schema..." -ForegroundColor Yellow
try {
    Get-Content "sql\schema.sql" | & "C:\xampp\mysql\bin\mysql.exe" -u root quiz_tool
    Write-Host "Schema imported successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to import schema: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Setup completed! Please check: http://localhost/quiz_tool/api/db_check.php" -ForegroundColor Cyan
Read-Host "Press Enter to exit"
