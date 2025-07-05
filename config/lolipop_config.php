<?php
/**
 * ロリポップ用データベース設定ファイル
 * 本番環境では環境変数または別の設定ファイルから読み込み
 */

// 環境判定
$is_production = !isset($_SERVER['HTTP_HOST']) || strpos($_SERVER['HTTP_HOST'], 'localhost') === false;

if ($is_production) {
    // ロリポップ本番環境設定
    $host = 'mysql-XX.lolipop.jp'; // ロリポップで提供されるホスト名に変更
    $db   = 'LAA0123456-quiztool'; // ロリポップのデータベース名に変更
    $user = 'LAA0123456';          // ロリポップのユーザー名に変更
    $pass = 'your_database_password'; // データベースパスワードに変更
    $charset = 'utf8mb4';
} else {
    // 開発環境設定（XAMPP）
    $host = 'localhost';
    $db   = 'quiz_tool';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';
}

// 開発モード設定
define('DEVELOPMENT_MODE', !$is_production);

// エラー表示設定（本番では無効化）
if (DEVELOPMENT_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
}
?>
