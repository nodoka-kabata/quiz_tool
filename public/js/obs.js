// obs.js OBS用表示
function fetchObsAnswers() {
    fetch('../api/obs.php')
        .then(res => res.json())
        .then(data => {
            const grid = document.getElementById('obs-grid');
            // 回答数に応じて列数を設定 (Zoomスタイル連動): 最大3列
            const n = data.answers.length;
            grid.classList.remove('cols-1','cols-2','cols-3');
            let cols;
            if (n <= 3) cols = n || 1;
            else if (n === 4) cols = 2;
            else cols = 3;
            grid.classList.add('cols-' + cols);
            grid.innerHTML = '';
            data.answers.forEach(ans => {
                const cell = document.createElement('div');
                cell.className = 'obs-cell';
                cell.dataset.userId = ans.user_id;
                cell.innerHTML = `
                    <div class='obs-answer'>${escapeHtml(ans.answer_text || '')}</div>
                    <div class='obs-name'>${escapeHtml(ans.name)}</div>
                `;
                grid.appendChild(cell);
            });
        });
}

// 番号バッジを更新
// 番号非表示化のため削除
// function updateObsIndices() {
//     // 番号バッジを更新: 非表示化
// }

// OBS表示側の並び順をサーバに保存
function updateObsOrderObs() {
    const orders = {};
    document.querySelectorAll('#obs-grid .obs-cell').forEach((el, index) => {
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
    }).catch(err => console.error('OBS順保存エラー:', err));
}

// ドキュメント読み込み時にSortable設定
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('obs-grid');
    if (window.Sortable) {
        Sortable.create(grid, {
            animation: 150,
            handle: '.obs-cell',
            onEnd: () => {
                updateObsOrderObs();
            }
        });
    }
    fetchObsAnswers();
    setInterval(fetchObsAnswers, 2000);
});

function escapeHtml(str) {
    return str.replace(/[&<>"]/g, function(m) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
    });
}
