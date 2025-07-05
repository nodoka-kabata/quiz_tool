// ダッシュボード統計情報
class DashboardStats {
    constructor() {
        this.stats = {
            totalUsers: 0,
            activeUsers: 0,
            answeredUsers: 0,
            kickedUsers: 0,
            lastUpdate: null
        };
        this.updateInterval = null;
    }

    // 統計情報を更新
    async updateStats() {
        try {
            const response = await fetch('/api/stats.php');
            const data = await response.json();
            
            this.stats = { ...this.stats, ...data.stats };
            this.displayStats();
            this.stats.lastUpdate = new Date();
        } catch (error) {
            console.error('統計情報の更新に失敗:', error);
        }
    }

    // 統計情報を表示
    displayStats() {
        const statsContainer = document.getElementById('stats-container');
        if (!statsContainer) return;

        statsContainer.innerHTML = `
            <div class="stat-card">
                <i class="fas fa-users"></i>
                <div class="stat-info">
                    <div class="stat-value">${this.stats.totalUsers}</div>
                    <div class="stat-label">総参加者</div>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-circle text-success"></i>
                <div class="stat-info">
                    <div class="stat-value">${this.stats.activeUsers}</div>
                    <div class="stat-label">接続中</div>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-check-circle"></i>
                <div class="stat-info">
                    <div class="stat-value">${this.stats.answeredUsers}</div>
                    <div class="stat-label">回答済み</div>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-ban text-danger"></i>
                <div class="stat-info">
                    <div class="stat-value">${this.stats.kickedUsers}</div>
                    <div class="stat-label">キック済み</div>
                </div>
            </div>
        `;
    }

    // 自動更新開始
    startAutoUpdate(interval = 5000) {
        this.updateStats(); // 初回実行
        this.updateInterval = setInterval(() => {
            this.updateStats();
        }, interval);
    }

    // 自動更新停止
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// グローバルに利用可能にする
window.dashboardStats = new DashboardStats();
