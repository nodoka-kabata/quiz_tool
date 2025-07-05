-- 問題管理機能追加用マイグレーション
-- 既存のデータベースに問題管理機能を追加する場合に実行してください

-- 問題テーブル作成
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    answer_type ENUM('text','number','choice') DEFAULT 'text',
    time_limit INT DEFAULT 60,
    max_length INT DEFAULT 200,
    question_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- answersテーブルにquestion_idカラムを追加
ALTER TABLE answers ADD COLUMN question_id INT DEFAULT NULL AFTER user_id;

-- quiz_stateテーブルにcurrent_question_idカラムを追加
ALTER TABLE quiz_state ADD COLUMN current_question_id INT DEFAULT NULL AFTER state;

-- 外部キー制約を追加
ALTER TABLE answers ADD FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE SET NULL;
ALTER TABLE quiz_state ADD FOREIGN KEY (current_question_id) REFERENCES questions(id) ON DELETE SET NULL;

-- サンプル問題を追加（デモ用）
INSERT INTO questions (title, description, answer_type, time_limit, max_length, question_order) VALUES
('第1問: 基本問題', 'この問題に自由に回答してください', 'text', 60, 200, 1),
('第2問: 数値問題', '数値で回答してください', 'number', 45, 50, 2),
('第3問: 短答問題', '簡潔に回答してください', 'text', 30, 100, 3);

-- デモ用として第1問を現在の問題に設定
UPDATE quiz_state SET current_question_id = (SELECT id FROM questions WHERE question_order = 1 LIMIT 1) WHERE id = 1;
