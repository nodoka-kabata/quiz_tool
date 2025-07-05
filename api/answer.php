<?php
// 回答送信・取得API
require_once 'debug_setup.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONSリクエストへの対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = intval($_POST['user_id'] ?? 0);
    $answer = trim($_POST['answer'] ?? '');
    $question_id = intval($_POST['question_id'] ?? 0);
    
    // 入力検証
    if ($user_id === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'ユーザーIDが無効です']);
        exit;
    }
    
    if ($answer === '') {
        http_response_code(400);
        echo json_encode(['error' => '回答を入力してください']);
        exit;
    }
    
    if (mb_strlen($answer) > 500) {
        http_response_code(400);
        echo json_encode(['error' => '回答は500文字以内で入力してください']);
        exit;
    }
    
    // XSS対策
    $answer = htmlspecialchars($answer, ENT_QUOTES, 'UTF-8');
    
    try {
        // ユーザーの存在とキック状態をチェック
        $stmt = $pdo->prepare('SELECT is_kicked FROM users WHERE id = ?');
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'ユーザーが見つかりません']);
            exit;
        }
        
        if ($user['is_kicked']) {
            http_response_code(403);
            echo json_encode(['error' => 'あなたはキックされています']);
            exit;
        }
        
        // クイズの状態をチェック
        $stmt = $pdo->query('SELECT state FROM quiz_state WHERE id = 1');
        $quiz_state = $stmt->fetch();
        
        if (!$quiz_state || $quiz_state['state'] !== 'answering') {
            http_response_code(403);
            echo json_encode(['error' => '現在は回答期間ではありません']);
            exit;
        }
        
        // 現在の問題IDを取得（指定されていない場合）
        if (!$question_id) {
            $stmt = $pdo->query('SELECT current_question_id FROM quiz_state WHERE id = 1');
            $result = $stmt->fetch();
            $question_id = $result['current_question_id'] ?? 1;
        }
        
        // 問題の存在確認
        $stmt = $pdo->prepare('SELECT id FROM questions WHERE id = ? AND is_active = 1');
        $stmt->execute([$question_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => '指定された問題が見つかりません']);
            exit;
        }
        
        // 既に回答があれば上書き
        $stmt = $pdo->prepare('SELECT id FROM answers WHERE user_id = ? AND question_id = ?');
        $stmt->execute([$user_id, $question_id]);
        
        if ($row = $stmt->fetch()) {
            $stmt = $pdo->prepare('UPDATE answers SET answer_text = ?, is_hidden = 0, created_at = NOW() WHERE user_id = ? AND question_id = ?');
            $stmt->execute([$answer, $user_id, $question_id]);
            debug_log('Answer updated', ['user_id' => $user_id, 'question_id' => $question_id]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO answers (user_id, question_id, answer_text) VALUES (?, ?, ?)');
            $stmt->execute([$user_id, $question_id, $answer]);
            debug_log('Answer submitted', ['user_id' => $user_id, 'question_id' => $question_id]);
        }
        
        echo json_encode(['success' => true]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        debug_log('Answer submission failed', ['error' => $e->getMessage(), 'user_id' => $user_id]);
        echo json_encode(['error' => '回答の送信に失敗しました']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $question_id = intval($_GET['question_id'] ?? 0);
    
    try {
        // 現在の問題IDを取得（指定されていない場合）
        if (!$question_id) {
            $stmt = $pdo->query('SELECT current_question_id FROM quiz_state WHERE id = 1');
            $result = $stmt->fetch();
            $question_id = $result['current_question_id'] ?? 1;
        }
        
        // 回答一覧取得（管理者・OBS用）
        $sql = 'SELECT a.id, u.name, a.answer_text, a.is_hidden, u.display_order, a.question_id, a.created_at ' .
               'FROM answers a ' .
               'JOIN users u ON a.user_id = u.id ' .
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
        
    } catch (PDOException $e) {
        http_response_code(500);
        debug_log('Answer retrieval failed', ['error' => $e->getMessage()]);
        echo json_encode(['error' => '回答の取得に失敗しました']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => '不正なアクセスメソッドです']);
?>
