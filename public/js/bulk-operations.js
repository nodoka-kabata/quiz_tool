// 一括操作ユーティリティ
class BulkOperations {
    constructor() {
        this.selectedUsers = new Set();
        this.init();
    }

    init() {
        this.createBulkControls();
        this.bindEvents();
    }

    // 一括操作UI作成
    createBulkControls() {
        const controlsHTML = `
            <div id="bulk-controls" class="bulk-controls" style="display: none;">
                <div class="bulk-header">
                    <span class="selected-count">0件選択中</span>
                    <button class="btn btn-sm btn-secondary" id="select-all">全選択</button>
                    <button class="btn btn-sm btn-secondary" id="deselect-all">選択解除</button>
                </div>
                <div class="bulk-actions">
                    <button class="btn btn-sm btn-warning" id="bulk-kick">選択者をキック</button>
                    <button class="btn btn-sm btn-info" id="bulk-unkick">キック解除</button>
                    <button class="btn btn-sm btn-danger" id="bulk-hide-answers">回答を非表示</button>
                </div>
            </div>
        `;
        
        const usersListContainer = document.getElementById('users-list');
        if (usersListContainer) {
            usersListContainer.insertAdjacentHTML('beforebegin', controlsHTML);
        }
    }

    // イベント設定
    bindEvents() {
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('user-checkbox')) {
                this.handleUserSelection(e.target);
            }
        });

        document.getElementById('select-all')?.addEventListener('click', () => {
            this.selectAll();
        });

        document.getElementById('deselect-all')?.addEventListener('click', () => {
            this.deselectAll();
        });

        document.getElementById('bulk-kick')?.addEventListener('click', () => {
            this.bulkKick();
        });

        document.getElementById('bulk-unkick')?.addEventListener('click', () => {
            this.bulkUnkick();
        });

        document.getElementById('bulk-hide-answers')?.addEventListener('click', () => {
            this.bulkHideAnswers();
        });
    }

    // ユーザー選択処理
    handleUserSelection(checkbox) {
        const userId = parseInt(checkbox.value);
        
        if (checkbox.checked) {
            this.selectedUsers.add(userId);
        } else {
            this.selectedUsers.delete(userId);
        }
        
        this.updateBulkControls();
    }

    // 一括操作UI更新
    updateBulkControls() {
        const bulkControls = document.getElementById('bulk-controls');
        const selectedCount = document.querySelector('.selected-count');
        
        if (this.selectedUsers.size > 0) {
            bulkControls.style.display = 'block';
            selectedCount.textContent = `${this.selectedUsers.size}件選択中`;
        } else {
            bulkControls.style.display = 'none';
        }
    }

    // 全選択
    selectAll() {
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = true;
            this.selectedUsers.add(parseInt(cb.value));
        });
        this.updateBulkControls();
    }

    // 選択解除
    deselectAll() {
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = false;
        });
        this.selectedUsers.clear();
        this.updateBulkControls();
    }

    // 一括キック
    async bulkKick() {
        if (!confirm(`${this.selectedUsers.size}人をキックしますか？`)) return;
        
        const promises = Array.from(this.selectedUsers).map(userId => 
            this.sendAction('kick', { user_id: userId })
        );
        
        try {
            await Promise.all(promises);
            this.showNotification('一括キックが完了しました', 'success');
            this.deselectAll();
            window.loadUsers?.(); // ユーザーリスト更新
        } catch (error) {
            this.showNotification('一括キックに失敗しました', 'error');
        }
    }

    // 一括キック解除
    async bulkUnkick() {
        if (!confirm(`${this.selectedUsers.size}人のキックを解除しますか？`)) return;
        
        const promises = Array.from(this.selectedUsers).map(userId => 
            this.sendAction('unkick', { user_id: userId })
        );
        
        try {
            await Promise.all(promises);
            this.showNotification('一括キック解除が完了しました', 'success');
            this.deselectAll();
            window.loadUsers?.();
        } catch (error) {
            this.showNotification('一括キック解除に失敗しました', 'error');
        }
    }

    // 一括回答非表示
    async bulkHideAnswers() {
        if (!confirm(`${this.selectedUsers.size}人の回答を非表示にしますか？`)) return;
        
        try {
            // まず該当ユーザーの回答IDを取得
            const response = await fetch('/api/answer.php');
            const data = await response.json();
            
            const targetAnswers = data.answers.filter(answer => 
                this.selectedUsers.has(answer.user_id)
            );
            
            const promises = targetAnswers.map(answer => 
                this.sendAction('hide', { answer_id: answer.id })
            );
            
            await Promise.all(promises);
            this.showNotification('一括非表示が完了しました', 'success');
            this.deselectAll();
            window.loadAnswers?.(); // 回答リスト更新
        } catch (error) {
            this.showNotification('一括非表示に失敗しました', 'error');
        }
    }

    // API送信
    async sendAction(action, data) {
        const formData = new FormData();
        formData.append('action', action);
        
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });
        
        const response = await fetch('/api/admin.php', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return response.json();
    }

    // 通知表示
    showNotification(message, type = 'info') {
        // 既存の通知システムを使用、または独自実装
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // 簡易的な通知表示
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// グローバルに利用可能にする
window.bulkOperations = new BulkOperations();
