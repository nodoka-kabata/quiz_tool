// デバッグヘルパーが未定義でも実行できるようスタブを定義
if (!window.DebugHelper) {
    window.DebugHelper = {
        log: () => {},
        error: () => {},
        apiCall: (url, opts) => fetch(url, opts),
        updateDebugInfo: () => {},
        showError: () => {}
    };
}

let userId = null;
let heartbeatTimer = null;

function showArea(area) {
    DebugHelper.log(`Showing area: ${area}`);
    document.getElementById('register-area').style.display = area === 'register' ? '' : 'none';
    document.getElementById('wait-area').style.display = area === 'wait' ? '' : 'none';
    document.getElementById('answer-area').style.display = area === 'answer' ? '' : 'none';
    DebugHelper.updateDebugInfo(userId, area);
}

function checkState() {
    DebugHelper.apiCall('../api/admin.php', {
        method: 'POST',
        body: new URLSearchParams({action: 'sync_admin'})
    })
    .then(res => res.json())
    .then(data => {
        DebugHelper.log('State check response', data);
        if (data.error) {
            DebugHelper.error('State check error', data.error);
            DebugHelper.showError(`状態確認エラー: ${data.error}`);
            return;
        }
        
        if (data.state === 'waiting') showArea('wait');
        else if (data.state === 'answering') showArea('answer');
        else if (data.state === 'closed') showArea('wait');
        setTimeout(checkState, 2000);
    })
    .catch(error => {
        DebugHelper.error('State check failed', error);
        setTimeout(checkState, 5000); // エラー時は少し長めに待つ
    });
}

// 登録後 heartbeat 開始
function startHeartbeat() {
    if (!userId) return;
    // 30秒ごとに心拍送信
    heartbeatTimer = setInterval(() => {
        fetch('../api/heartbeat.php', {
            method: 'POST',
            body: new URLSearchParams({user_id: userId})
        });
    }, 30000);
    // ページ離脱時にタイマークリア
    window.addEventListener('beforeunload', () => clearInterval(heartbeatTimer));
}

// 登録成功後の画面遷移とハートビート開始
const registerBtn = document.getElementById('register-btn');
registerBtn.onclick = () => {
    const name = document.getElementById('name-input').value.trim();
    if (!name) {
        DebugHelper.log('Registration failed: empty name');
        return;
    }
    // 二重送信防止
    registerBtn.disabled = true;

    DebugHelper.log(`Registering user: ${name}`);
    DebugHelper.apiCall('../api/register.php', {
        method: 'POST',
        body: new URLSearchParams({name})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            userId = data.user_id;
            startHeartbeat();
            checkState();
        } else {
            DebugHelper.error('Registration failed', data.error);
            document.getElementById('register-msg').textContent = data.error;
        }
        registerBtn.disabled = false;
    })
    .catch(error => {
        DebugHelper.error('Registration request failed', error);
        document.getElementById('register-msg').textContent = 'サーバーエラーが発生しました';
        registerBtn.disabled = false;
    });
};

const answerBtn = document.getElementById('answer-btn');
answerBtn.onclick = () => {
    const answer = document.getElementById('answer-input').value.trim();
    if (!answer || !userId) {
        DebugHelper.log('Answer submission failed', {answer: !!answer, userId});
        return;
    }
    // 二重送信防止
    answerBtn.disabled = true;
    
    DebugHelper.log(`Submitting answer for user ${userId}:`, answer);
    DebugHelper.apiCall('../api/answer.php', {
        method: 'POST',
        body: new URLSearchParams({user_id: userId, answer})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById('answer-msg').textContent = '送信しました';
        } else {
            DebugHelper.error('Answer submission failed', data.error);
            document.getElementById('answer-msg').textContent = data.error;
        }
        answerBtn.disabled = false;
    })
    .catch(error => {
        DebugHelper.error('Answer submission request failed', error);
        document.getElementById('answer-msg').textContent = 'サーバーエラーが発生しました';
        answerBtn.disabled = false;
    });
};
