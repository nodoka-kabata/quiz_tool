// CAIND QUIZ SYSTEM バージョン管理
let QUIZ_SYSTEM_VERSION = "Ver.0.0.2 beta"; // フォールバック値

// version.jsonからバージョン情報を読み込み
async function loadVersionInfo() {
    try {
        const response = await fetch('/version.json');
        if (response.ok) {
            const versionData = await response.json();
            QUIZ_SYSTEM_VERSION = `Ver.${versionData.version} ${versionData.status}`;
        }
    } catch (error) {
        console.log('バージョン情報の読み込みに失敗しました:', error);
        // フォールバック値を使用
    }
}

// バージョン表示関数
function displayVersion() {
    const versionElements = document.querySelectorAll('.version-display');
    versionElements.forEach(element => {
        element.textContent = QUIZ_SYSTEM_VERSION;
    });
}

// DOM読み込み完了後にバージョンを表示
document.addEventListener('DOMContentLoaded', async function() {
    await loadVersionInfo();
    displayVersion();
});
