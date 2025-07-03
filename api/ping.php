<?php
// Ping API
header('Content-Type: application/json');
require_once 'db.php'; // 認証や他APIと同様の要件があれば読み込む

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 疎通確認用、シンプルにOKを返却
    echo json_encode(['ok' => true]);
    exit;
}

// GET以外は許可しない
http_response_code(405);
echo json_encode(['error' => 'GETでアクセスしてください']);
