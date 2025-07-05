<?php
// ユーザー一覧取得API
require_once 'debug_setup.php';
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 登録ユーザー (回答の有無にかかわらず)
    $stmt = $pdo->query(
        'SELECT u.id, u.name, u.internal_name, u.created_at AS registered_at, '
      . 'u.last_heartbeat, u.is_kicked, a.answer_text, a.created_at AS answered_at '
      . 'FROM users u '
      . 'LEFT JOIN answers a ON u.id = a.user_id '
      . 'WHERE 1 '
      . 'ORDER BY u.display_order, u.created_at'
    );
    $users = $stmt->fetchAll();
    echo json_encode(['users' => $users]);
    exit;
}
echo json_encode(['error' => '不正なアクセス']);
