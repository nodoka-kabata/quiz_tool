<?php
// 回答送信・取得API
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = intval($_POST['user_id'] ?? 0);
    $answer = trim($_POST['answer'] ?? '');
    if ($user_id === 0 || $answer === '') {
        echo json_encode(['error' => '不正な入力']);
        exit;
    }
    // 既に回答があれば上書き
    $stmt = $pdo->prepare('SELECT id FROM answers WHERE user_id = ?');
    $stmt->execute([$user_id]);
    if ($row = $stmt->fetch()) {
        $stmt = $pdo->prepare('UPDATE answers SET answer_text = ?, is_hidden = 0, created_at = NOW() WHERE user_id = ?');
        $stmt->execute([$answer, $user_id]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO answers (user_id, answer_text) VALUES (?, ?)');
        $stmt->execute([$user_id, $answer]);
    }
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 回答一覧取得（管理者・OBS用）
    $stmt = $pdo->query('SELECT a.id, u.name, a.answer_text, a.is_hidden, u.display_order FROM answers a JOIN users u ON a.user_id = u.id WHERE u.is_kicked = 0 ORDER BY u.display_order, a.created_at');
    $answers = $stmt->fetchAll();
    echo json_encode(['answers' => $answers]);
    exit;
}
echo json_encode(['error' => '不正なアクセス']);
