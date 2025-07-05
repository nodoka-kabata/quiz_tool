<?php
// 問題管理API
require_once 'debug_setup.php';
header('Content-Type: application/json');
require_once 'db.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        // 問題一覧取得
        $stmt = $pdo->query('SELECT * FROM questions ORDER BY question_order, created_at');
        $questions = $stmt->fetchAll();
        echo json_encode(['success' => true, 'questions' => $questions]);
        break;
        
    case 'add':
        // 問題追加
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $answer_type = $_POST['answer_type'] ?? 'text'; // text, number, choice
        $time_limit = intval($_POST['time_limit'] ?? 60); // 秒
        $max_length = intval($_POST['max_length'] ?? 200);
        
        if (empty($title)) {
            echo json_encode(['error' => '問題タイトルは必須です']);
            exit;
        }
        
        // 次の順序番号を取得
        $stmt = $pdo->query('SELECT MAX(question_order) as max_order FROM questions');
        $maxOrder = (int)$stmt->fetch()['max_order'];
        $nextOrder = $maxOrder + 1;
        
        $stmt = $pdo->prepare('INSERT INTO questions (title, description, answer_type, time_limit, max_length, question_order) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([$title, $description, $answer_type, $time_limit, $max_length, $nextOrder]);
        
        echo json_encode(['success' => true, 'question_id' => $pdo->lastInsertId()]);
        break;
        
    case 'update':
        // 問題更新
        $question_id = intval($_POST['question_id'] ?? 0);
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $answer_type = $_POST['answer_type'] ?? 'text';
        $time_limit = intval($_POST['time_limit'] ?? 60);
        $max_length = intval($_POST['max_length'] ?? 200);
        $is_active = intval($_POST['is_active'] ?? 1);
        
        if (!$question_id || empty($title)) {
            echo json_encode(['error' => '問題IDとタイトルは必須です']);
            exit;
        }
        
        $stmt = $pdo->prepare('UPDATE questions SET title = ?, description = ?, answer_type = ?, time_limit = ?, max_length = ?, is_active = ? WHERE id = ?');
        $stmt->execute([$title, $description, $answer_type, $time_limit, $max_length, $is_active, $question_id]);
        
        echo json_encode(['success' => true]);
        break;
        
    case 'delete':
        // 問題削除
        $question_id = intval($_POST['question_id'] ?? 0);
        if (!$question_id) {
            echo json_encode(['error' => '問題IDは必須です']);
            exit;
        }
        
        // 関連する回答も削除
        $pdo->prepare('DELETE FROM answers WHERE question_id = ?')->execute([$question_id]);
        $pdo->prepare('DELETE FROM questions WHERE id = ?')->execute([$question_id]);
        
        echo json_encode(['success' => true]);
        break;
        
    case 'reorder':
        // 問題順序変更
        $orders = $_POST['orders'] ?? [];
        if (!is_array($orders)) {
            echo json_encode(['error' => '順序データが不正です']);
            exit;
        }
        
        foreach ($orders as $question_id => $order) {
            $pdo->prepare('UPDATE questions SET question_order = ? WHERE id = ?')->execute([$order, $question_id]);
        }
        
        echo json_encode(['success' => true]);
        break;
        
    case 'set_current':
        // 現在の問題を設定
        $question_id = intval($_POST['question_id'] ?? 0);
        if (!$question_id) {
            echo json_encode(['error' => '問題IDは必須です']);
            exit;
        }
        
        // 現在の問題をリセット
        $pdo->prepare('UPDATE quiz_state SET current_question_id = ? WHERE id = 1')->execute([$question_id]);
        
        echo json_encode(['success' => true]);
        break;
        
    case 'get_current':
        // 現在の問題取得
        $stmt = $pdo->query('SELECT qs.current_question_id, q.* FROM quiz_state qs LEFT JOIN questions q ON qs.current_question_id = q.id WHERE qs.id = 1');
        $current = $stmt->fetch();
        
        echo json_encode(['success' => true, 'current_question' => $current]);
        break;
        
    default:
        echo json_encode(['error' => '不正なアクション']);
}
?>
