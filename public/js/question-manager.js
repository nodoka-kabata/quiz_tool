// 問題管理システム
class QuestionManager {
    constructor() {
        this.questions = [];
        this.currentQuestionId = null;
        this.init();
    }

    init() {
        this.createQuestionPanel();
        this.bindEvents();
        this.loadQuestions();
    }

    // 問題管理パネルを作成
    createQuestionPanel() {
        const panelHTML = `
            <div class="panel question-panel">
                <div class="panel-header">
                    <h3><i class="fas fa-question-circle"></i> 問題管理</h3>
                    <div class="panel-controls">
                        <button class="btn btn-sm btn-primary" id="add-question-btn">
                            <i class="fas fa-plus"></i> 問題追加
                        </button>
                        <button class="btn btn-sm btn-success" id="import-questions-btn">
                            <i class="fas fa-upload"></i> インポート
                        </button>
                    </div>
                </div>
                <div class="panel-body">
                    <div class="current-question-display">
                        <h4>現在の問題:</h4>
                        <div id="current-question-info" class="current-question-info">
                            問題が選択されていません
                        </div>
                    </div>
                    <div id="questions-list" class="questions-list"></div>
                </div>
            </div>
        `;

        // content-gridに追加
        const contentGrid = document.querySelector('.content-grid');
        contentGrid.insertAdjacentHTML('beforeend', panelHTML);
    }

    // イベントバインド
    bindEvents() {
        document.getElementById('add-question-btn').addEventListener('click', () => {
            this.showQuestionModal();
        });

        document.getElementById('import-questions-btn').addEventListener('click', () => {
            this.showImportModal();
        });
    }

    // 問題一覧を読み込み
    async loadQuestions() {
        try {
            const response = await fetch('../api/questions.php?action=list');
            const data = await response.json();
            
            if (data.success) {
                this.questions = data.questions;
                this.displayQuestions();
                this.loadCurrentQuestion();
            }
        } catch (error) {
            console.error('問題読み込みエラー:', error);
        }
    }

    // 現在の問題を読み込み
    async loadCurrentQuestion() {
        try {
            const response = await fetch('../api/questions.php?action=get_current');
            const data = await response.json();
            
            if (data.success && data.current_question) {
                this.currentQuestionId = data.current_question.current_question_id;
                this.displayCurrentQuestion(data.current_question);
            }
        } catch (error) {
            console.error('現在の問題読み込みエラー:', error);
        }
    }

    // 問題一覧を表示
    displayQuestions() {
        const container = document.getElementById('questions-list');
        
        if (this.questions.length === 0) {
            container.innerHTML = '<p class="no-questions">問題がありません</p>';
            return;
        }

        const questionsHTML = this.questions.map((question, index) => `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-header">
                    <div class="question-number">${index + 1}</div>
                    <div class="question-title">${this.escapeHtml(question.title)}</div>
                    <div class="question-status ${question.is_active ? 'active' : 'inactive'}">
                        ${question.is_active ? 'アクティブ' : '非アクティブ'}
                    </div>
                </div>
                <div class="question-meta">
                    <span class="question-type">${this.getAnswerTypeLabel(question.answer_type)}</span>
                    <span class="question-time">${question.time_limit}秒</span>
                    <span class="question-length">最大${question.max_length}文字</span>
                </div>
                <div class="question-actions">
                    <button class="btn btn-xs btn-success ${this.currentQuestionId == question.id ? 'active' : ''}" 
                            onclick="questionManager.setCurrentQuestion(${question.id})">
                        ${this.currentQuestionId == question.id ? '現在の問題' : '問題に設定'}
                    </button>
                    <button class="btn btn-xs btn-info" onclick="questionManager.editQuestion(${question.id})">
                        <i class="fas fa-edit"></i> 編集
                    </button>
                    <button class="btn btn-xs btn-danger" onclick="questionManager.deleteQuestion(${question.id})">
                        <i class="fas fa-trash"></i> 削除
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = questionsHTML;
        
        // ソート可能にする
        if (window.Sortable) {
            new Sortable(container, {
                animation: 150,
                onEnd: (evt) => {
                    this.reorderQuestions(evt);
                }
            });
        }
    }

    // 現在の問題を表示
    displayCurrentQuestion(questionData) {
        const container = document.getElementById('current-question-info');
        
        if (!questionData || !questionData.title) {
            container.innerHTML = '問題が選択されていません';
            return;
        }

        container.innerHTML = `
            <div class="current-question-detail">
                <h5>${this.escapeHtml(questionData.title)}</h5>
                <p>${this.escapeHtml(questionData.description || '')}</p>
                <div class="current-question-meta">
                    <span>${this.getAnswerTypeLabel(questionData.answer_type)}</span>
                    <span>制限時間: ${questionData.time_limit}秒</span>
                    <span>最大文字数: ${questionData.max_length}</span>
                </div>
            </div>
        `;
    }

    // 問題モーダルを表示
    showQuestionModal(questionId = null) {
        const question = questionId ? this.questions.find(q => q.id == questionId) : null;
        const isEdit = !!question;
        
        const modalHTML = `
            <div id="question-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-question-circle"></i> ${isEdit ? '問題編集' : '問題追加'}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="question-form">
                            <input type="hidden" id="question-id" value="${question?.id || ''}">
                            
                            <div class="form-group">
                                <label for="question-title">問題タイトル *</label>
                                <input type="text" id="question-title" class="form-control" 
                                       value="${question?.title || ''}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="question-description">問題説明</label>
                                <textarea id="question-description" class="form-control" rows="3"
                                          placeholder="問題の詳細説明（任意）">${question?.description || ''}</textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="answer-type">回答形式</label>
                                    <select id="answer-type" class="form-control">
                                        <option value="text" ${question?.answer_type === 'text' ? 'selected' : ''}>テキスト</option>
                                        <option value="number" ${question?.answer_type === 'number' ? 'selected' : ''}>数値</option>
                                        <option value="choice" ${question?.answer_type === 'choice' ? 'selected' : ''}>選択肢</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="time-limit">制限時間（秒）</label>
                                    <input type="number" id="time-limit" class="form-control" 
                                           value="${question?.time_limit || 60}" min="10" max="600">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="max-length">最大文字数</label>
                                    <input type="number" id="max-length" class="form-control" 
                                           value="${question?.max_length || 200}" min="10" max="1000">
                                </div>
                                
                                <div class="form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="is-active" 
                                               ${(question?.is_active ?? 1) ? 'checked' : ''}>
                                        アクティブ
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="questionManager.hideQuestionModal()">キャンセル</button>
                        <button class="btn btn-primary" onclick="questionManager.saveQuestion()">${isEdit ? '更新' : '追加'}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // イベント設定
        document.querySelector('#question-modal .modal-close').addEventListener('click', () => {
            this.hideQuestionModal();
        });
    }

    // 問題モーダルを非表示
    hideQuestionModal() {
        const modal = document.getElementById('question-modal');
        if (modal) {
            modal.remove();
        }
    }

    // 問題を保存
    async saveQuestion() {
        const form = document.getElementById('question-form');
        const formData = new FormData();
        
        const questionId = document.getElementById('question-id').value;
        const isEdit = !!questionId;
        
        formData.append('action', isEdit ? 'update' : 'add');
        if (isEdit) formData.append('question_id', questionId);
        
        formData.append('title', document.getElementById('question-title').value);
        formData.append('description', document.getElementById('question-description').value);
        formData.append('answer_type', document.getElementById('answer-type').value);
        formData.append('time_limit', document.getElementById('time-limit').value);
        formData.append('max_length', document.getElementById('max-length').value);
        formData.append('is_active', document.getElementById('is-active').checked ? 1 : 0);

        try {
            const response = await fetch('../api/questions.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.hideQuestionModal();
                this.loadQuestions();
                window.bulkOperations.showNotification(
                    `問題を${isEdit ? '更新' : '追加'}しました`,
                    'success'
                );
            } else {
                window.bulkOperations.showNotification(data.error || 'エラーが発生しました', 'error');
            }
        } catch (error) {
            window.bulkOperations.showNotification('保存に失敗しました', 'error');
        }
    }

    // 問題を編集
    editQuestion(questionId) {
        this.showQuestionModal(questionId);
    }

    // 問題を削除
    async deleteQuestion(questionId) {
        const question = this.questions.find(q => q.id == questionId);
        if (!question) return;
        
        if (!confirm(`問題「${question.title}」を削除しますか？\n関連する回答も削除されます。`)) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('question_id', questionId);

            const response = await fetch('../api/questions.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.loadQuestions();
                window.bulkOperations.showNotification('問題を削除しました', 'success');
            } else {
                window.bulkOperations.showNotification(data.error || '削除に失敗しました', 'error');
            }
        } catch (error) {
            window.bulkOperations.showNotification('削除に失敗しました', 'error');
        }
    }

    // 現在の問題に設定
    async setCurrentQuestion(questionId) {
        try {
            const formData = new FormData();
            formData.append('action', 'set_current');
            formData.append('question_id', questionId);

            const response = await fetch('../api/questions.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentQuestionId = questionId;
                this.loadQuestions(); // 表示を更新
                this.loadCurrentQuestion();
                window.bulkOperations.showNotification('現在の問題を設定しました', 'success');
            } else {
                window.bulkOperations.showNotification(data.error || '設定に失敗しました', 'error');
            }
        } catch (error) {
            window.bulkOperations.showNotification('設定に失敗しました', 'error');
        }
    }

    // 問題順序を変更
    async reorderQuestions(evt) {
        const orders = {};
        const questionItems = document.querySelectorAll('.question-item');
        
        questionItems.forEach((item, index) => {
            const questionId = item.dataset.questionId;
            orders[questionId] = index + 1;
        });

        try {
            const formData = new FormData();
            formData.append('action', 'reorder');
            formData.append('orders', JSON.stringify(orders));

            const response = await fetch('../api/questions.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.loadQuestions();
                window.bulkOperations.showNotification('問題順序を変更しました', 'success');
            }
        } catch (error) {
            window.bulkOperations.showNotification('順序変更に失敗しました', 'error');
        }
    }

    // ユーティリティ関数
    getAnswerTypeLabel(type) {
        const labels = {
            'text': 'テキスト',
            'number': '数値',
            'choice': '選択肢'
        };
        return labels[type] || 'テキスト';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // インポート機能（将来の拡張用）
    showImportModal() {
        // TODO: CSVやJSONからの問題インポート機能
        window.bulkOperations.showNotification('インポート機能は準備中です', 'info');
    }
}

// グローバルに利用可能にする
window.questionManager = new QuestionManager();
