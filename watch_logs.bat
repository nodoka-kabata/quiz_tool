@echo off
echo PHPエラーログ監視を開始します...
echo Ctrl+Cで終了
echo.

:loop
if exist "%~dp0debug.log" (
    type "%~dp0debug.log"
    timeout /t 2 >nul
    cls
    echo === PHPデバッグログ ===
    echo 最終更新: %date% %time%
    echo.
    type "%~dp0debug.log"
    echo.
    echo === 監視中... Ctrl+Cで終了 ===
) else (
    echo debug.logが見つかりません。APIが実行されるとログが作成されます。
    timeout /t 2 >nul
)
goto loop
