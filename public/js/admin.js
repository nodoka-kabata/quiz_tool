// admin.js 管理者用（モダンUI対応）
let answersData = [];
let usersData = [];

// デバッグ初期化(adminのみ)
if (window.DebugHelper) {
    DebugHelper.init();
}

// AbortControllers for preventing overlapping requests
let fetchAnswersController = null;
let fetchUsersController = null;
let fetchStateController = null;
let isDragging = false;

function fetchAnswers() {
    if (window.DebugHelper) DebugHelper.log('fetchAnswers: start');
    if (fetchAnswersController) fetchAnswersController.abort();
    fetchAnswersController = new AbortController();
    fetch('../api/answer.php', { signal: fetchAnswersController.signal })
        .then(res => res.json())
        .then(data => {
            if (window.DebugHelper) DebugHelper.log('fetchAnswers: data', data);
            answersData = data.answers;
            displayAnswers();
        })
        .catch(err => {
            if (err.name === 'AbortError') return;
            console.error('回答取得エラー:', err);
            // TODO: UI通知など追加可能
        });
}
/**
 * 回答一覧（OBS表示）の並び順を更新し、サーバーに保存する
 */
function updateObsOrder() {
    const orders = {};
    document.querySelectorAll('#answers-list .list-item').forEach((el, index) => {
        const uid = el.dataset.userId;
        if (uid) orders[uid] = index;
    });
    const params = new URLSearchParams();
    params.append('action', 'order');
    Object.entries(orders).forEach(([uid, order]) => {
        params.append(`orders[${uid}]`, order);
    });
    fetch('../api/admin.php', {
        method: 'POST',
        body: params
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) console.error('OBS順更新失敗:', data.error);
    })
    .catch(err => console.error('OBS順更新エラー:', err));
}

function fetchUsers() {
    if (window.DebugHelper) DebugHelper.log('fetchUsers: start');
    if (fetchUsersController) fetchUsersController.abort();
    fetchUsersController = new AbortController();
    // 登録ユーザー一覧を取得 (回答前後を含む)
    fetch('../api/users.php', { signal: fetchUsersController.signal })
        .then(res => res.json())
        .then(data => {
            if (window.DebugHelper) DebugHelper.log('fetchUsers: data', data);
            if (data.users) {
                usersData = data.users;
                displayUsers();
            } else {
                console.error('ユーザー取得エラー:', data.error || '不明なエラー');
                // TODO: UI通知
            }
        })
        .catch(err => {
            if (err.name === 'AbortError') return;
            console.error('ユーザー取得エラー:', err);
            // TODO: UI通知
        });
}

function displayAnswers() {
    const list = document.getElementById('answers-list');
    const showAnswers = document.getElementById('show-answers').checked;
    
    if (!showAnswers) {
        list.innerHTML = '<div class="empty-state">回答一覧を非表示にしています</div>';
        return;
    }
    
    if (answersData.length === 0) {
        list.innerHTML = '<div class="empty-state">まだ回答がありません</div>';
        return;
    }
    
    // ドラッグ＆ドロップ順に display_order でソート
    const sortedAnswers = [...answersData].sort((a, b) => a.display_order - b.display_order);
    
    list.innerHTML = '';
    sortedAnswers.forEach((ans, index) => {
        const div = document.createElement('div');
        // 順位表示
        const numBadge = document.createElement('div');
        numBadge.className = 'list-item-number';
        numBadge.textContent = index + 1;
        div.appendChild(numBadge);
        // OBS表示順制御用のユーザーIDをデータ属性に設定
        div.dataset.userId = ans.user_id;
        div.className = 'list-item';
        
        const timeStr = ans.created_at ? 
            new Date(ans.created_at).toLocaleTimeString('ja-JP', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            }) : '';
        
        div.innerHTML = `
            <div class="list-item-header">
                <div class="list-item-name">${escapeHtml(ans.name)}</div>
                <div class="list-item-actions">
                    <button class="btn-small btn-hide" onclick="hideAnswer(${ans.id})">
                        <i class="fas fa-eye-slash"></i> 非表示
                    </button>
                </div>
            </div>
            <div class="list-item-content">
                <div><strong>回答:</strong> ${escapeHtml(ans.answer_text || '未回答')}</div>
                ${timeStr ? `<div><strong>時刻:</strong> ${timeStr}</div>` : ''}
            </div>
        `;
        list.appendChild(div);
    });
}

function displayUsers() {
    const list = document.getElementById('users-list');
    // 接続状態の判定（1分未更新で切断とみなす）
    const now = Date.now();
    // 接続状態判定（1分未更新で切断）
    usersData.forEach(u => {
        u.connected = u.last_heartbeat && (now - new Date(u.last_heartbeat).getTime()) < 60000;
    });
    // 10分以上切断かつキック済みのユーザーは一覧から除外し、接続中のみ表示
    const filtered = usersData.filter(u => {
        const last = u.last_heartbeat ? new Date(u.last_heartbeat).getTime() : 0;
        const longDisconnected = last && (now - last > 10 * 60 * 1000);
        return !(u.is_kicked && longDisconnected);
    });
    // display_order順にソート
    const sortedUsers = [...filtered].sort((a, b) => a.display_order - b.display_order);

    // 接続中ユーザーのみ抽出
    const connectedUsers = sortedUsers.filter(u => u.connected);
    if (connectedUsers.length === 0) {
        list.innerHTML = '<div class="empty-state">回答者がいません</div>';
        return;
    }

    // 接続中ユーザー表示
    list.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'group-header';
    header.textContent = '接続中ユーザー';
    list.appendChild(header);
    connectedUsers.forEach((user, idx) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.dataset.userId = user.id;
        // 番号バッジ
        const badge = document.createElement('div');
        badge.className = 'list-item-number';
        badge.textContent = idx + 1;
        div.appendChild(badge);
        const answered = !!user.answer_text;
        const statusText = answered ? '回答済み' : '未回答';
        const statusColor = answered ? 'var(--success-color)' : 'var(--warning-color)';
        const timeInfo = answered && user.answered_at
            ? `<div><strong>時刻:</strong> ${new Date(user.answered_at).toLocaleTimeString('ja-JP')}</div>`
            : '';
        div.innerHTML = `
                <div class="list-item-header">
                    <div class="list-item-name">${escapeHtml(user.name)}</div>
                    <div class="list-item-actions">
                        <button class="btn-small btn-kick" onclick="kickUser(${user.id})">
                            <i class="fas fa-user-times"></i> キック
                        </button>
                    </div>
                </div>
                <div class="list-item-content">
                    <div><strong>ステータス:</strong> <span style="color: ${statusColor}">${statusText}</span></div>
                    ${timeInfo}
                </div>
            `;
        list.appendChild(div);
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function hideAnswer(id) {
    // キャンセル用コントローラ初期化不要（二重送信対策内部）
    fetch('../api/admin.php', {
        method: 'POST',
        body: new URLSearchParams({action: 'hide', answer_id: id})
    })
    .then(response => {
        if (response.ok) {
            fetchAnswers();
        } else {
            console.error('非表示処理に失敗しました');
        }
    })
    .catch(err => console.error('非表示エラー:', err));
}

function kickUser(id) {
    if (!confirm('このユーザーをキックしますか？')) return;
    // 二重送信防止
    const btn = event.currentTarget;
    btn.disabled = true;
    
    fetch('../api/admin.php', {
        method: 'POST',
        body: new URLSearchParams({action: 'kick', user_id: id})
    })
    .then(response => {
        if (response.ok) {
            fetchAnswers();
            fetchUsers();
        } else {
            console.error('キック処理に失敗しました');
        }
        btn.disabled = false;
    })
    .catch(err => {
        console.error('キックエラー:', err);
        btn.disabled = false;
    });
}

function updateState() {
    if (fetchStateController) fetchStateController.abort();
    fetchStateController = new AbortController();
    fetch('../api/admin.php', {
        method: 'POST',
        body: new URLSearchParams({action: 'sync_admin'}),
        signal: fetchStateController.signal
    })
    .then(res => res.json())
    .then(data => {
        const stateMsg = document.getElementById('state-msg');
        const stateText = data.state || '不明';
        stateMsg.textContent = `現在の状態: ${stateText}`;
        stateMsg.style.background = getStateColor(stateText);
    })
    .catch(err => {
        if (err.name === 'AbortError') return;
        console.error('状態取得エラー:', err);
        // TODO: UI通知
    });
}

function getStateColor(state) {
    switch (state) {
        case 'started':
        case '開始':
            return 'var(--success-color)';
        case 'closed':
        case '締切':
            return 'var(--warning-color)';
        case 'waiting':
        case '待機':
        default:
            return 'var(--card-bg)';
    }
}
/**
/**
 * ユーザーリストの並び順を更新し、サーバーに保存する
 */
function updateUserOrder() {
    const orders = {};
    document.querySelectorAll('#users-list .list-item').forEach((el, index) => {
        const uid = el.dataset.userId;
        if (uid) orders[uid] = index;
    });
    const params = new URLSearchParams();
    params.append('action', 'order');
    Object.entries(orders).forEach(([uid, order]) => {
        params.append(`orders[${uid}]`, order);
    });
    fetch('../api/admin.php', {
        method: 'POST',
        body: params
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) console.error('表示順更新失敗:', data.error);
    })
    .catch(err => console.error('表示順更新エラー:', err));
}

// イベントリスナー設定
document.getElementById('start-btn').onclick = () => {
    fetch('../api/admin.php', {
        method: 'POST',
        body: new URLSearchParams({action: 'start'})
    }).then(() => updateState());
};

document.getElementById('close-btn').onclick = () => {
    fetch('../api/admin.php', {
        method: 'POST',
        body: new URLSearchParams({action: 'close'})
    }).then(() => updateState());
};

document.getElementById('reset-btn').onclick = () => {
    if (!confirm('全ての回答をリセットしますか？この操作は取り消せません。')) return;
    
    fetch('../api/admin.php', {
        method: 'POST',
        body: new URLSearchParams({action: 'reset'})
    }).then(() => {
        updateState();
        fetchAnswers();
        fetchUsers();
    });
};

// チェックボックスとソート機能のイベントリスナー
document.addEventListener('DOMContentLoaded', () => {
    // 定期的にPingしてサーバ疎通確認
    const stateIndicator = document.getElementById('state-msg');
    function pingServer() {
        fetch('../api/ping.php?ts=' + Date.now(), { cache: 'no-cache' })
            .then(res => res.json())
            .then(json => {
                // サーバ疎通OK: エラー状態を解除
                stateIndicator.classList.remove('error');
            })
            .catch(() => {
                // 疎通失敗: エラー状態を表示
                stateIndicator.classList.add('error');
            });
    }
    pingServer();
    setInterval(pingServer, 5000);
    
    const showAnswersCheckbox = document.getElementById('show-answers');
    showAnswersCheckbox.addEventListener('change', displayAnswers);
    // ユーザーリストをドラッグ＆ドロップで並び替え
    if (window.Sortable) {
        const usersListElem = document.getElementById('users-list');
        Sortable.create(usersListElem, {
            animation: 150,
            handle: '.list-item',
            onStart: () => { isDragging = true; },
            onEnd: () => { isDragging = false; updateUserOrder(); },
        });
        const answersListElem = document.getElementById('answers-list');
        Sortable.create(answersListElem, {
            animation: 150,
            handle: '.list-item',
            onStart: () => { isDragging = true; },
            onEnd: () => { isDragging = false; updateObsOrder(); },
        });
    }
    // 初期データ取得と定期更新
    fetchAnswers();
    fetchUsers();
    updateState();
    
    setInterval(() => {
        if (!isDragging) {
            fetchAnswers();
            fetchUsers();
            updateState();
        }
    }, 3000);
    // OBS埋め込み表示のイベント設定
    const obsBtn = document.getElementById('obs-btn');
    const obsContainer = document.getElementById('obs-container');
    const closeObsBtn = document.getElementById('close-obs-btn');
    if (obsBtn && obsContainer) {
        obsBtn.addEventListener('click', () => {
            obsContainer.style.display = 'block';
        });
    }
    if (closeObsBtn && obsContainer) {
        closeObsBtn.addEventListener('click', () => {
            obsContainer.style.display = 'none';
        });
    }
    // OBSパネルの表示切替
    const toggleObs = document.getElementById('toggle-obs');
    const obsBody = document.querySelector('.obs-panel .panel-body');
    if (toggleObs && obsBody) {
        // 初期表示状態
        obsBody.style.display = toggleObs.checked ? '' : 'none';
        toggleObs.addEventListener('change', () => {
            obsBody.style.display = toggleObs.checked ? '' : 'none';
        });
    }
});
