@echo off
setlocal enabledelayedexpansion

echo CAIND QUIZ SYSTEM - バージョン管理ツール
echo =====================================
echo.

if "%1"=="" (
    echo 使用方法:
    echo   update_version.bat [新しいバージョン] [ステータス]
    echo.
    echo 例:
    echo   update_version.bat 0.0.3 beta
    echo   update_version.bat 1.0.0 stable
    echo.
    echo 現在のバージョン情報:
    type version.json
    goto :end
)

set NEW_VERSION=%1
set STATUS=%2
if "%STATUS%"=="" set STATUS=beta

echo 新しいバージョン: %NEW_VERSION% %STATUS%
echo.

rem version.jsonを更新
echo {> version.json
echo   "name": "CAIND QUIZ SYSTEM",>> version.json
echo   "version": "%NEW_VERSION%",>> version.json
echo   "status": "%STATUS%",>> version.json
echo   "build": "%date:~0,4%%date:~5,2%%date:~8,2%",>> version.json
echo   "description": "テレビクイズ番組風の回答表示システム",>> version.json
echo   "author": "nodoka-kabata",>> version.json
echo   "repository": "https://github.com/nodoka-kabata/quiz_tool">> version.json
echo }>> version.json

echo version.jsonを更新しました。
echo.
echo Gitコミットを作成しますか？ (y/n)
set /p COMMIT_CHOICE=

if /i "%COMMIT_CHOICE%"=="y" (
    git add version.json
    git commit -m "バージョンを%NEW_VERSION% %STATUS%に更新"
    echo.
    echo GitHubにプッシュしますか？ (y/n)
    set /p PUSH_CHOICE=
    if /i "!PUSH_CHOICE!"=="y" (
        git push origin main
        echo バージョン更新が完了しました！
    )
)

:end
pause
