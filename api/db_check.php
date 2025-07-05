<?php
// データベース接続テスト
$host = 'localhost';
$db   = 'quiz_tool';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

header('Content-Type: application/json');

try {
    // まずMySQLサーバーへの接続テスト
    $pdo_server = new PDO("mysql:host=$host;charset=$charset", $user, $pass);
    
    // データベースが存在するかチェック
    $stmt = $pdo_server->query("SHOW DATABASES LIKE 'quiz_tool'");
    $db_exists = $stmt->rowCount() > 0;
    
    if (!$db_exists) {
        echo json_encode([
            'status' => 'error',
            'message' => 'データベース quiz_tool が存在しません',
            'suggestion' => 'データベースを作成してからスキーマをインポートしてください'
        ]);
        exit;
    }
    
    // データベースへの接続テスト
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    // テーブルの存在確認
    $tables = ['users', 'questions', 'answers', 'quiz_state'];
    $missing_tables = [];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() == 0) {
            $missing_tables[] = $table;
        }
    }
    
    if (!empty($missing_tables)) {
        echo json_encode([
            'status' => 'error',
            'message' => '必要なテーブルが存在しません: ' . implode(', ', $missing_tables),
            'suggestion' => 'sql/schema.sql をインポートしてください'
        ]);
        exit;
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'データベース接続正常',
        'database' => $db,
        'tables' => $tables
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'データベース接続エラー: ' . $e->getMessage()
    ]);
}
?>
