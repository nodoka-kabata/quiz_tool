-- デバッグ用クエリ集

-- 1. 現在の状態を確認
SELECT * FROM quiz_state;

-- 2. 全ユーザーの確認
SELECT 
    id, 
    name, 
    is_admin, 
    is_kicked, 
    display_order, 
    created_at 
FROM users 
ORDER BY created_at DESC;

-- 3. 全回答の確認
SELECT 
    a.id,
    u.name,
    a.answer_text,
    a.is_hidden,
    a.created_at
FROM answers a
JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC;

-- 4. 統計情報
SELECT 
    '総ユーザー数' as metric,
    COUNT(*) as count
FROM users
WHERE is_kicked = 0
UNION ALL
SELECT 
    '回答済みユーザー数' as metric,
    COUNT(DISTINCT user_id) as count
FROM answers
UNION ALL
SELECT 
    '総回答数' as metric,
    COUNT(*) as count
FROM answers;

-- 5. データリセット用（テスト時）
-- DELETE FROM answers;
-- DELETE FROM users;
-- UPDATE quiz_state SET state = 'waiting' WHERE id = 1;

-- 6. テストデータ作成
-- INSERT INTO users (name, is_admin) VALUES ('テスト管理者', 1);
-- INSERT INTO users (name) VALUES ('テスト回答者1'), ('テスト回答者2');
