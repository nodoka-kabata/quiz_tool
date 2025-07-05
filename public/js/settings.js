// アプリケーション設定管理
class SettingsManager {
    constructor() {
        this.settings = {
            autoRefresh: true,
            refreshInterval: 5000,
            soundNotifications: true,
            darkMode: false,
            showTimestamps: true,
            maxAnswerLength: 200,
            kickInactiveUsers: false,
            inactiveTimeout: 300000 // 5分
        };
        
        this.loadSettings();
        this.createSettingsModal();
    }

    // 設定を読み込み
    loadSettings() {
        const savedSettings = localStorage.getItem('quiz-system-settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        this.applySettings();
    }

    // 設定を保存
    saveSettings() {
        localStorage.setItem('quiz-system-settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    // 設定を適用
    applySettings() {
        // ダークモード
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // 自動更新
        if (this.settings.autoRefresh) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }

        // タイムスタンプ表示
        document.body.classList.toggle('show-timestamps', this.settings.showTimestamps);
    }

    // 設定モーダル作成
    createSettingsModal() {
        const modalHTML = `
            <div id="settings-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-cog"></i> システム設定</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="setting-group">
                            <h4>表示設定</h4>
                            <label class="setting-item">
                                <input type="checkbox" id="dark-mode"> ダークモード
                            </label>
                            <label class="setting-item">
                                <input type="checkbox" id="show-timestamps"> タイムスタンプ表示
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <h4>更新設定</h4>
                            <label class="setting-item">
                                <input type="checkbox" id="auto-refresh"> 自動更新
                            </label>
                            <label class="setting-item">
                                更新間隔:
                                <input type="range" id="refresh-interval" min="1000" max="30000" step="1000">
                                <span id="interval-display">5秒</span>
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <h4>通知設定</h4>
                            <label class="setting-item">
                                <input type="checkbox" id="sound-notifications"> 音声通知
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <h4>管理設定</h4>
                            <label class="setting-item">
                                最大回答文字数:
                                <input type="number" id="max-answer-length" min="50" max="1000">
                            </label>
                            <label class="setting-item">
                                <input type="checkbox" id="kick-inactive"> 非アクティブユーザーを自動キック
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="settings-cancel">キャンセル</button>
                        <button class="btn btn-primary" id="settings-save">設定を保存</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindSettingsEvents();
    }

    // 設定イベント設定
    bindSettingsEvents() {
        // モーダル開閉
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideSettings();
        });

        document.getElementById('settings-cancel').addEventListener('click', () => {
            this.hideSettings();
        });

        document.getElementById('settings-save').addEventListener('click', () => {
            this.saveSettingsFromModal();
        });

        // 更新間隔表示
        document.getElementById('refresh-interval').addEventListener('input', (e) => {
            const seconds = e.target.value / 1000;
            document.getElementById('interval-display').textContent = `${seconds}秒`;
        });
    }

    // 設定表示
    showSettings() {
        this.populateSettingsModal();
        document.getElementById('settings-modal').style.display = 'block';
    }

    // 設定非表示
    hideSettings() {
        document.getElementById('settings-modal').style.display = 'none';
    }

    // モーダルに現在の設定を反映
    populateSettingsModal() {
        document.getElementById('dark-mode').checked = this.settings.darkMode;
        document.getElementById('show-timestamps').checked = this.settings.showTimestamps;
        document.getElementById('auto-refresh').checked = this.settings.autoRefresh;
        document.getElementById('refresh-interval').value = this.settings.refreshInterval;
        document.getElementById('interval-display').textContent = `${this.settings.refreshInterval / 1000}秒`;
        document.getElementById('sound-notifications').checked = this.settings.soundNotifications;
        document.getElementById('max-answer-length').value = this.settings.maxAnswerLength;
        document.getElementById('kick-inactive').checked = this.settings.kickInactiveUsers;
    }

    // モーダルから設定を保存
    saveSettingsFromModal() {
        this.settings.darkMode = document.getElementById('dark-mode').checked;
        this.settings.showTimestamps = document.getElementById('show-timestamps').checked;
        this.settings.autoRefresh = document.getElementById('auto-refresh').checked;
        this.settings.refreshInterval = parseInt(document.getElementById('refresh-interval').value);
        this.settings.soundNotifications = document.getElementById('sound-notifications').checked;
        this.settings.maxAnswerLength = parseInt(document.getElementById('max-answer-length').value);
        this.settings.kickInactiveUsers = document.getElementById('kick-inactive').checked;
        
        this.saveSettings();
        this.hideSettings();
        
        // 設定反映の通知
        this.showNotification('設定が保存されました', 'success');
    }

    // 自動更新開始
    startAutoRefresh() {
        this.stopAutoRefresh(); // 既存のタイマーをクリア
        
        this.refreshTimer = setInterval(() => {
            if (typeof window.loadUsers === 'function') window.loadUsers();
            if (typeof window.loadAnswers === 'function') window.loadAnswers();
            if (typeof window.dashboardStats?.updateStats === 'function') window.dashboardStats.updateStats();
        }, this.settings.refreshInterval);
    }

    // 自動更新停止
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    // 通知表示
    showNotification(message, type = 'info') {
        if (window.bulkOperations?.showNotification) {
            window.bulkOperations.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// グローバルに利用可能にする
window.settingsManager = new SettingsManager();
