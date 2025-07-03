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
    answer_text TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE quiz_state (
    id INT PRIMARY KEY,
    state ENUM('waiting','answering','closed','reset') NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 初期状態をwaitingでセット
INSERT INTO quiz_state (id, state) VALUES (1, 'waiting');
