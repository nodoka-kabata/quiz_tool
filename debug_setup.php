<?php
// デバッグ用設定ファイル
// 各APIファイルの先頭でincludeして使用

// エラー表示を有効化
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// JSONレスポンス用のエラーハンドラ
function debug_error_handler($errno, $errstr, $errfile, $errline) {
    $error = [
        'type' => 'PHP Error',
        'message' => $errstr,
        'file' => $errfile,
        'line' => $errline,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    error_log(json_encode($error));
    return false;
}
set_error_handler('debug_error_handler');

// ログファイルの設定
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');

// デバッグ用関数
function debug_log($message, $data = null) {
    $log = [
        'timestamp' => date('Y-m-d H:i:s'),
        'message' => $message,
        'data' => $data
    ];
    error_log(json_encode($log, JSON_UNESCAPED_UNICODE));
}

// リクエストの詳細をログに記録
debug_log('Request received', [
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'post' => $_POST,
    'get' => $_GET
]);
?>
