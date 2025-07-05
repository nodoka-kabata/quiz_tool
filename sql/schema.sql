-- クイズ解答表示ツール用DBスキーマ

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    internal_name VARCHAR(100) NOT NULL,
    last_heartbeat TIMESTAMP NULL DEFAULT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_kicked BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question_id INT DEFAULT NULL,
    answer_text TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE SET NULL
);

CREATE TABLE questions (
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

CREATE TABLE quiz_state (
    id INT PRIMARY KEY,
    state ENUM('waiting','answering','closed','reset') NOT NULL,
    current_question_id INT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (current_question_id) REFERENCES questions(id) ON DELETE SET NULL
);

-- 初期状態をwaitingでセット
INSERT INTO quiz_state (id, state) VALUES (1, 'waiting');

-- デフォルト問題を作成
INSERT INTO questions (title, description, answer_type, time_limit, max_length, question_order) 
VALUES ('デフォルト問題', '最初に作成される問題です。管理画面から編集してください。', 'text', 60, 200, 1);
