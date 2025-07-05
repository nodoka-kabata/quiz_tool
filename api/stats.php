<?php
// 統計情報取得API
require_once 'debug_setup.php';
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // 総参加者数
        $stmt = $pdo->query('SELECT COUNT(*) as total FROM users');
        $totalUsers = (int)$stmt->fetch()['total'];
        
        // アクティブユーザー数（最近のハートビート）
        $stmt = $pdo->query('SELECT COUNT(*) as active FROM users WHERE last_heartbeat > DATE_SUB(NOW(), INTERVAL 30 SECOND) AND is_kicked = 0');
        $activeUsers = (int)$stmt->fetch()['active'];
        
        // 回答済みユーザー数
        $stmt = $pdo->query('SELECT COUNT(DISTINCT a.user_id) as answered FROM answers a JOIN users u ON a.user_id = u.id WHERE u.is_kicked = 0');
        $answeredUsers = (int)$stmt->fetch()['answered'];
        
        // キック済みユーザー数
        $stmt = $pdo->query('SELECT COUNT(*) as kicked FROM users WHERE is_kicked = 1');
        $kickedUsers = (int)$stmt->fetch()['kicked'];
        
        // 現在の状態
        $stmt = $pdo->query('SELECT state, updated_at FROM quiz_state WHERE id = 1');
        $stateInfo = $stmt->fetch();
        
        // 最新の回答
        $stmt = $pdo->query('SELECT a.created_at FROM answers a JOIN users u ON a.user_id = u.id WHERE u.is_kicked = 0 ORDER BY a.created_at DESC LIMIT 1');
        $lastAnswer = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'stats' => [
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'answeredUsers' => $answeredUsers,
                'kickedUsers' => $kickedUsers,
                'currentState' => $stateInfo['state'] ?? 'waiting',
                'stateUpdated' => $stateInfo['updated_at'] ?? null,
                'lastAnswer' => $lastAnswer['created_at'] ?? null,
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ]);
    } catch (Exception $e) {
        debug_log('Stats API Error', ['error' => $e->getMessage()]);
        echo json_encode(['error' => '統計情報の取得に失敗しました']);
    }
} else {
    echo json_encode(['error' => 'GETリクエストのみ対応']);
}
?>
