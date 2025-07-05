// SSL/HTTPS 強制とセキュリティ設定
(function() {
    'use strict';
    
    // 開発環境判定
    const isDevelopment = location.hostname === 'localhost' || 
                         location.hostname === '127.0.0.1' || 
                         location.hostname.includes('.local');
    
    // 本番環境でHTTPS強制
    if (!isDevelopment && location.protocol !== 'https:') {
        location.replace('https:' + window.location.href.substring(window.location.protocol.length));
    }
    
    // Fetch APIのデフォルト設定を拡張（HTTPS使用）
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // 相対URLの場合は現在のプロトコルを使用
        if (typeof url === 'string' && url.startsWith('/')) {
            url = location.protocol + '//' + location.host + url;
        }
        
        // デフォルトオプションを設定
        const defaultOptions = {
            credentials: 'same-origin', // CSRF対策
            headers: {
                'X-Requested-With': 'XMLHttpRequest', // AJAX識別
                ...options.headers
            }
        };
        
        return originalFetch(url, { ...defaultOptions, ...options });
    };
    
    // CSRFトークン管理（将来の拡張用）
    window.SecurityManager = {
        // SSL証明書の有効性チェック（可能な場合）
        checkSSLCertificate: function() {
            if (location.protocol === 'https:') {
                console.log('✅ SSL接続が確立されています');
                return true;
            } else {
                console.warn('⚠️ HTTP接続です。本番環境ではHTTPSを使用してください');
                return false;
            }
        },
        
        // セキュアな通信確認
        verifySecureConnection: function() {
            const isSecure = location.protocol === 'https:' || isDevelopment;
            if (isSecure) {
                console.log('🔒 セキュアな接続です');
            } else {
                console.error('🔓 非セキュアな接続が検出されました');
            }
            return isSecure;
        }
    };
    
    // ページロード時にセキュリティチェック実行
    document.addEventListener('DOMContentLoaded', function() {
        window.SecurityManager.checkSSLCertificate();
        window.SecurityManager.verifySecureConnection();
    });
    
})();
