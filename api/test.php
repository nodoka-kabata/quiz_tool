<?php
// シンプルなテスト用API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

echo json_encode([
    'status' => 'success',
    'message' => 'API接続テスト成功',
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
