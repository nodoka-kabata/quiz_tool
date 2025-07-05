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
    // HTTPS強制
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    
    // コンテンツタイプスニッフィング防止
    header('X-Content-Type-Options: nosniff');
    
    // XSS保護
    header('X-XSS-Protection: 1; mode=block');
    
    // クリックジャッキング防止
    header('X-Frame-Options: SAMEORIGIN');
    
    // リファラーポリシー
    header('Referrer-Policy: strict-origin-when-cross-origin');
    
    // CSP（Content Security Policy）- 基本設定
    $csp = "default-src 'self'; " .
           "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " .
           "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " .
           "font-src 'self' https://cdnjs.cloudflare.com; " .
           "img-src 'self' data:; " .
           "connect-src 'self';";
    header('Content-Security-Policy: ' . $csp);
}

// 本番環境でのみHTTPS強制を有効化
if (!defined('DEVELOPMENT_MODE') || !DEVELOPMENT_MODE) {
    force_https();
}

// セキュリティヘッダーは常に設定
set_security_headers();
?>
