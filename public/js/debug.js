// デバッグ用ユーティリティ
class DebugHelper {
    static isDebugMode = true; // 本番環境では false に

    static log(message, data = null) {
        if (!this.isDebugMode) return;
        console.log(`[DEBUG] ${new Date().toLocaleString()}: ${message}`, data);
        // 管理画面のデバッグパネルにログを追加
        const logContainer = document.getElementById('debug-log');
        if (logContainer) {
            const entry = document.createElement('div');
            entry.textContent = `${new Date().toLocaleTimeString()} [DEBUG] ${message}` + (data !== null ? `: ${JSON.stringify(data)}` : '');
            logContainer.appendChild(entry);
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }

    static error(message, error = null) {
        if (!this.isDebugMode) return;
        console.error(`[ERROR] ${new Date().toLocaleString()}: ${message}`, error);
    }

    static apiCall(url, options = {}) {
        this.log(`API Call: ${url}`, options);
        
        return fetch(url, options)
            .then(response => {
                this.log(`API Response Status: ${response.status}`, {
                    url: url,
                    status: response.status,
                    ok: response.ok
                });
                return response;
            })
            .catch(error => {
                this.error(`API Call Failed: ${url}`, error);
                throw error;
            });
    }

    static showNetworkRequests() {
        // ネットワークタブでのAPIコール追跡用
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            console.group(`🌐 API Call: ${url}`);
            console.log('Options:', options);
            
            return originalFetch(url, options)
                .then(response => {
                    console.log('Response Status:', response.status);
                    const clonedResponse = response.clone();
                    clonedResponse.json()
                        .then(data => console.log('Response Data:', data))
                        .catch(() => console.log('Response (not JSON)'));
                    console.groupEnd();
                    return response;
                })
                .catch(error => {
                    console.error('Request Failed:', error);
                    console.groupEnd();
                    throw error;
                });
        };
    }

    static init() {
        if (!this.isDebugMode) return;
        
        // デバッグモード表示
        document.body.insertAdjacentHTML('afterbegin', `
            <div id="debug-panel" style="
                position: fixed; 
                bottom: 0; 
                right: 0; 
                width: 350px; 
                max-height: 300px; 
                background: rgba(0,0,0,0.8); 
                color: white; 
                padding: 10px; 
                border-radius: 5px 0 0 0; 
                font-size: 12px;
                overflow: auto;
                z-index: 9999;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>🔧 DEBUG MODE</div>
                    <button onclick="DebugHelper.clearLocalStorage()" style="background:transparent; border:none; color:white;">Clear</button>
                </div>
                <div>User ID: <span id="debug-user-id">none</span></div>
                <div>State: <span id="debug-state">unknown</span></div>
                <hr style="border-color: rgba(255,255,255,0.2);">
                <div id="debug-log" style="max-height:150px; overflow-y:auto; font-size:11px;"></div>
            </div>
        `);

        // ネットワーク監視を開始
        this.showNetworkRequests();
    }

    static updateDebugInfo(userId, state) {
        if (!this.isDebugMode) return;
        const userIdEl = document.getElementById('debug-user-id');
        const stateEl = document.getElementById('debug-state');
        if (userIdEl) userIdEl.textContent = userId || 'none';
        if (stateEl) stateEl.textContent = state || 'unknown';
    }

    static clearLocalStorage() {
        localStorage.clear();
        sessionStorage.clear();
        location.reload();
    }

    // エラーをUIに表示
    static showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50px;
            right: 10px;
            background: #ff4444;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    DebugHelper.init();
});
