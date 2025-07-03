<?php
// デバッグ設定を読み込み
require_once '../debug_setup.php';

// DB接続設定
$host = 'localhost';
$db   = 'quiz-app'; // データベース名は適宜変更
$user = 'root';    // ユーザー名はphpMyAdminの設定に合わせて
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB接続失敗: ' . $e->getMessage()]);
    exit;
}
?>
