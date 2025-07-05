<?php
// 回答者登録API
require_once 'debug_setup.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONSリクエストへの対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    
    // 入力検証
    if ($name === '') {
        http_response_code(400);
        echo json_encode(['error' => '名前を入力してください']);
        exit;
    }
    
    if (mb_strlen($name) > 50) {
        http_response_code(400);
        echo json_encode(['error' => '名前は50文字以内で入力してください']);
        exit;
    }
    
    // 危険な文字の除去
    $name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $name = preg_replace('/[<>"\']/', '', $name);
    
    if (empty(trim($name))) {
        http_response_code(400);
        echo json_encode(['error' => '有効な名前を入力してください']);
        exit;
    }
    
    try {
        // 重複を許容しつつ、内部用ユニーク名を生成
        $base = mb_strtolower(preg_replace('/\s+/', '-', $name));
        $base = preg_replace('/[^a-z0-9\-_]/', '', $base);
        if (empty($base)) {
            $base = 'user';
        }
        
        $likePattern = $base . '%';
        $stmt = $pdo->prepare('SELECT COUNT(*) AS cnt FROM users WHERE internal_name LIKE ?');
        $stmt->execute([$likePattern]);
        $count = (int)$stmt->fetch()['cnt'];
        $suffix = str_pad($count, 2, '0', STR_PAD_LEFT);
        $internalName = $base . '-' . $suffix;
        
        // 最大登録数チェック（スパム防止）
        $stmt = $pdo->query('SELECT COUNT(*) AS total FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)');
        $recent_count = (int)$stmt->fetch()['total'];
        if ($recent_count > 100) {
            http_response_code(429);
            echo json_encode(['error' => '登録が集中しています。しばらくお待ちください。']);
            exit;
        }
        
        // ユーザー登録
        $stmt = $pdo->prepare('INSERT INTO users (name, internal_name) VALUES (?, ?)');
        $stmt->execute([$name, $internalName]);
        $user_id = $pdo->lastInsertId();
        
        debug_log('User registered', ['user_id' => $user_id, 'name' => $name, 'internal_name' => $internalName]);
        
        echo json_encode([
            'success' => true, 
            'user_id' => $user_id,
            'name' => $name
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        debug_log('Registration failed', ['error' => $e->getMessage(), 'name' => $name]);
        echo json_encode(['error' => '登録に失敗しました。もう一度お試しください。']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'POSTメソッドでアクセスしてください']);
?>
