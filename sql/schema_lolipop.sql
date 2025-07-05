-- CAIND QUIZ SYSTEM - ロリポップ用データベーススキーマ
-- ロリポップのphpMyAdminで実行してください

-- 外部キー制約チェックを無効化
SET FOREIGN_KEY_CHECKS = 0;

-- 既存のテーブルが存在する場合は削除（注意：データが削除されます）
-- DROP TABLE IF EXISTS quiz_state;
-- DROP TABLE IF EXISTS answers;
-- DROP TABLE IF EXISTS questions;
-- DROP TABLE IF EXISTS users;

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '表示名',
    internal_name VARCHAR(100) NOT NULL COMMENT '内部管理用ユニーク名',
    last_heartbeat TIMESTAMP NULL DEFAULT NULL COMMENT '最終接続時刻',
    is_admin BOOLEAN DEFAULT FALSE COMMENT '管理者フラグ',
    is_kicked BOOLEAN DEFAULT FALSE COMMENT 'キック状態',
    display_order INT DEFAULT 0 COMMENT '表示順序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '登録日時'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 問題テーブル
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '問題タイトル',
    description TEXT COMMENT '問題詳細',
    answer_type ENUM('text','number','choice') DEFAULT 'text' COMMENT '回答形式',
    time_limit INT DEFAULT 60 COMMENT '制限時間（秒）',
    max_length INT DEFAULT 200 COMMENT '回答最大文字数',
    question_order INT DEFAULT 0 COMMENT '問題順序',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'アクティブ状態',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 回答テーブル
CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'ユーザーID',
    question_id INT DEFAULT NULL COMMENT '問題ID',
    answer_text TEXT COMMENT '回答内容',
    is_hidden BOOLEAN DEFAULT FALSE COMMENT '非表示フラグ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '回答日時',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE SET NULL,
    INDEX idx_user_question (user_id, question_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- クイズ状態テーブル
CREATE TABLE IF NOT EXISTS quiz_state (
    id INT PRIMARY KEY,
    state ENUM('waiting','answering','closed','reset') NOT NULL COMMENT 'クイズ状態',
    current_question_id INT DEFAULT NULL COMMENT '現在の問題ID',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
    FOREIGN KEY (current_question_id) REFERENCES questions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初期データを挿入
INSERT IGNORE INTO questions (id, title, description, answer_type, time_limit, max_length, question_order) 
VALUES (1, 'デフォルト問題', '最初に作成される問題です。管理画面から編集してください。', 'text', 60, 200, 1);

-- 初期状態をwaitingでセット
INSERT IGNORE INTO quiz_state (id, state, current_question_id) VALUES (1, 'waiting', 1);

-- 外部キー制約チェックを再有効化
SET FOREIGN_KEY_CHECKS = 1;

-- インデックス最適化
ANALYZE TABLE users, questions, answers, quiz_state;

-- 確認用クエリ
SELECT 'テーブル作成完了' as status;
SELECT 
    'users' as table_name, 
    COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 
    'questions' as table_name, 
    COUNT(*) as record_count 
FROM questions
UNION ALL
SELECT 
    'answers' as table_name, 
    COUNT(*) as record_count 
FROM answers
UNION ALL
SELECT 
    'quiz_state' as table_name, 
    COUNT(*) as record_count 
FROM quiz_state;
