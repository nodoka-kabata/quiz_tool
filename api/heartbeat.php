<?php
// 心拍ハートビートAPI
require_once 'debug_setup.php';
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = intval($_POST['user_id'] ?? 0);
    if ($user_id) {
        $stmt = $pdo->prepare('UPDATE users SET last_heartbeat = NOW() WHERE id = ?');
        $stmt->execute([$user_id]);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'user_id 必須']);
    }
    exit;
}
echo json_encode(['error' => 'POSTでアクセスしてください']);
