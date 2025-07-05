<?php
// SSL/セキュリティ設定を読み込み
require_once 'ssl_config.php';

// デバッグ設定を読み込み
require_once 'debug_setup.php';

// 環境判定
$is_production = !isset($_SERVER['HTTP_HOST']) || strpos($_SERVER['HTTP_HOST'], 'localhost') === false;

if ($is_production) {
    // ロリポップ本番環境設定
    $host = $_ENV['DB_HOST'] ?? 'mysql-XX.lolipop.jp';
    $db   = $_ENV['DB_NAME'] ?? 'LAA0123456-quiztool';
    $user = $_ENV['DB_USER'] ?? 'LAA0123456';
    $pass = $_ENV['DB_PASS'] ?? 'your_database_password';
    $charset = 'utf8mb4';
} else {
    // 開発環境設定（XAMPP）
    $host = 'localhost';
    $db   = 'quiz_tool';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';
}

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
];

try {
    // 接続前にデータベースの存在確認（開発環境のみ）
    if (!$is_production) {
        $pdo_check = new PDO("mysql:host=$host;charset=$charset", $user, $pass, $options);
        $stmt = $pdo_check->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$db'");
        if ($stmt->rowCount() === 0) {
            http_response_code(500);
            echo json_encode([
                'error' => 'データベースが存在しません',
                'message' => "データベース '$db' が見つかりません。setup_database.bat を実行してください。"
            ]);
            debug_log('Database not found', ['database' => $db]);
            exit;
        }
    }
    
    // データベースに接続
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // 必要なテーブルの存在確認
    $required_tables = ['users', 'questions', 'answers', 'quiz_state'];
    $missing_tables = [];
    
    foreach ($required_tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() === 0) {
            $missing_tables[] = $table;
        }
    }
    
    if (!empty($missing_tables)) {
        http_response_code(500);
        echo json_encode([
            'error' => '必要なテーブルが存在しません',
            'missing_tables' => $missing_tables,
            'message' => $is_production ? 'システム管理者にお問い合わせください。' : 'sql/schema.sql をインポートしてください。'
        ]);
        debug_log('Missing tables', ['missing' => $missing_tables]);
        exit;
    }
    
    debug_log('Database connection successful', ['database' => $db, 'environment' => $is_production ? 'production' : 'development']);
    
} catch (PDOException $e) {
    http_response_code(500);
    $error_message = $is_production ? 'データベース接続エラーが発生しました' : 'DB接続失敗: ' . $e->getMessage();
    echo json_encode([
        'error' => $error_message,
        'suggestion' => $is_production ? 'システム管理者にお問い合わせください。' : 'XAMPPでMySQLが起動しているか確認してください。'
    ]);
    debug_log('Database connection failed', ['error' => $e->getMessage(), 'environment' => $is_production ? 'production' : 'development']);
    exit;
}
?>
