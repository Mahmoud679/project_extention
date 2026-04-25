<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
session_start();

$user = $_SESSION['user'] ?? null;
echo json_encode(['ok'=>true, 'user'=>$user], JSON_UNESCAPED_UNICODE);
