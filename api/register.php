<?php
// 回答者登録API
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    if ($name === '') {
        echo json_encode(['error' => '名前を入力してください']);
        exit;
    }
    // 重複を許容しつつ、内部用ユニーク名を生成
    $base = mb_strtolower(preg_replace('/\s+/', '-', $name));
    $likePattern = $base . '%';
    $stmt = $pdo->prepare('SELECT COUNT(*) AS cnt FROM users WHERE internal_name LIKE ?');
    $stmt->execute([$likePattern]);
    $count = (int)$stmt->fetch()['cnt'];
    $suffix = str_pad($count, 2, '0', STR_PAD_LEFT);
    $internalName = $base . '-' . $suffix;
    // ユーザー登録
    $stmt = $pdo->prepare('INSERT INTO users (name, internal_name) VALUES (?, ?)');
    $stmt->execute([$name, $internalName]);
    echo json_encode(['success' => true, 'user_id' => $pdo->lastInsertId()]);
    exit;
}
echo json_encode(['error' => 'POSTでアクセスしてください']);
