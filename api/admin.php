<?php
// 管理者操作API
require_once 'debug_setup.php';
header('Content-Type: application/json');
require_once 'db.php';

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'start':
        // 解答記入開始
        $pdo->prepare("UPDATE quiz_state SET state = 'answering', updated_at = NOW() WHERE id = 1")->execute();
        echo json_encode(['success' => true]);
        break;
    case 'close':
        // 締切
        $pdo->prepare("UPDATE quiz_state SET state = 'closed', updated_at = NOW() WHERE id = 1")->execute();
        echo json_encode(['success' => true]);
        break;
    case 'reset':
        // リセット
        $pdo->prepare("UPDATE quiz_state SET state = 'waiting', updated_at = NOW() WHERE id = 1")->execute();
        $pdo->prepare('DELETE FROM answers')->execute();
        $pdo->prepare('UPDATE users SET is_kicked = 0')->execute();
        echo json_encode(['success' => true]);
        break;
    case 'kick':
        // キック
        $user_id = intval($_POST['user_id'] ?? 0);
        if ($user_id) {
            $pdo->prepare('UPDATE users SET is_kicked = 1 WHERE id = ?')->execute([$user_id]);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'user_id必須']);
        }
        break;
    case 'hide':
        // 回答非表示
        $answer_id = intval($_POST['answer_id'] ?? 0);
        if ($answer_id) {
            $pdo->prepare('UPDATE answers SET is_hidden = 1 WHERE id = ?')->execute([$answer_id]);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'answer_id必須']);
        }
        break;
    case 'order':
        // 並び替え
        $orders = $_POST['orders'] ?? [];
        if (is_array($orders)) {
            foreach ($orders as $user_id => $order) {
                $pdo->prepare('UPDATE users SET display_order = ? WHERE id = ?')->execute([$order, $user_id]);
            }
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'orders必須']);
        }
        break;
    case 'sync_admin':
        // 管理者同期用: 状態取得
        $stmt = $pdo->query('SELECT state FROM quiz_state WHERE id = 1');
        $row = $stmt->fetch();
        echo json_encode(['state' => $row['state'] ?? 'waiting']);
        break;
    default:
        echo json_encode(['error' => '不正なアクション']);
}
