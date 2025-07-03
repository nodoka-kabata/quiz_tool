<?php
// OBS用表示API
header('Content-Type: application/json');
require_once 'db.php';

$sql = 'SELECT u.display_order, u.name, a.answer_text '
     . 'FROM answers a '
     . 'JOIN users u ON a.user_id = u.id '
     . 'WHERE a.is_hidden = 0 AND u.is_kicked = 0 '
     . 'ORDER BY u.display_order, a.created_at';
$stmt = $pdo->query($sql);
$answers = $stmt->fetchAll();
echo json_encode(['answers' => $answers]);
