<?php
// SSL/HTTPS設定ファイル
// 各ファイルの先頭でincludeして使用

// HTTPS強制リダイレクト（本番環境用）
function force_https() {
    // 開発環境では無効化（localhostの場合）
    if (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
        return;
    }
    
    // HTTPSでない場合はリダイレクト
    if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
        $redirect_url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
        header('Location: ' . $redirect_url, true, 301);
        exit();
    }
}

// セキュリティヘッダーの設定
function set_security_headers() {
    // 開発環境でのみHTTPS強制（本番では別途設定）
    if (!isset($_SERVER['HTTP_HOST']) || strpos($_SERVER['HTTP_HOST'], 'localhost') === false) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    }
    
    // コンテンツタイプスニッフィング防止
    header('X-Content-Type-Options: nosniff');
    
    // XSS保護
    header('X-XSS-Protection: 1; mode=block');
    
    // クリックジャッキング防止
    header('X-Frame-Options: SAMEORIGIN');
    
    // リファラーポリシー
    header('Referrer-Policy: strict-origin-when-cross-origin');
    
    // CORS設定（開発環境用）
    if (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }
}

// 本番環境でのみHTTPS強制を有効化
if (!defined('DEVELOPMENT_MODE') || !DEVELOPMENT_MODE) {
    force_https();
}

// セキュリティヘッダーは常に設定
set_security_headers();
?>
