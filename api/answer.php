<?php
// 回答送信・取得API
require_once 'debug_setup.php';
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = intval($_POST['user_id'] ?? 0);
    $answer = trim($_POST['answer'] ?? '');
    $question_id = intval($_POST['question_id'] ?? 0);
    
    if ($user_id === 0 || $answer === '') {
        echo json_encode(['error' => '不正な入力']);
        exit;
    }
    
    // 現在の問題IDを取得（指定されていない場合）
    if (!$question_id) {
        $stmt = $pdo->query('SELECT current_question_id FROM quiz_state WHERE id = 1');
        $result = $stmt->fetch();
        $question_id = $result['current_question_id'] ?? 1; // デフォルト問題1
    }
    
    // 既に回答があれば上書き
    $stmt = $pdo->prepare('SELECT id FROM answers WHERE user_id = ? AND question_id = ?');
    $stmt->execute([$user_id, $question_id]);
    if ($row = $stmt->fetch()) {
        $stmt = $pdo->prepare('UPDATE answers SET answer_text = ?, is_hidden = 0, created_at = NOW() WHERE user_id = ? AND question_id = ?');
        $stmt->execute([$answer, $user_id, $question_id]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO answers (user_id, question_id, answer_text) VALUES (?, ?, ?)');
        $stmt->execute([$user_id, $question_id, $answer]);
    }
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $question_id = intval($_GET['question_id'] ?? 0);
    
    // 現在の問題IDを取得（指定されていない場合）
    if (!$question_id) {
        $stmt = $pdo->query('SELECT current_question_id FROM quiz_state WHERE id = 1');
        $result = $stmt->fetch();
        $question_id = $result['current_question_id'] ?? 1; // デフォルト問題1
    }
    
    // 回答一覧取得（管理者・OBS用）
    $sql = 'SELECT a.id, u.name, a.answer_text, a.is_hidden, u.display_order, a.question_id ' .
           'FROM answers a JOIN users u ON a.user_id = u.id ' .
           'WHERE u.is_kicked = 0';
    
    if ($question_id) {
        $sql .= ' AND a.question_id = ?';
        $stmt = $pdo->prepare($sql . ' ORDER BY u.display_order, a.created_at');
        $stmt->execute([$question_id]);
    } else {
        $stmt = $pdo->prepare($sql . ' ORDER BY u.display_order, a.created_at');
        $stmt->execute();
    }
    
    $answers = $stmt->fetchAll();
    echo json_encode(['answers' => $answers]);
    exit;
}
echo json_encode(['error' => '不正なアクセス']);
