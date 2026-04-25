<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
session_start();

require_once __DIR__ . '/db.php';

function json_exit(int $code, array $data): void {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

$name  = trim($_POST['name'] ?? '');
$email = strtolower(trim($_POST['email'] ?? ''));
$pass  = (string)($_POST['password'] ?? '');

if (mb_strlen($name) < 2 || mb_strlen($name) > 60) json_exit(400, ['ok'=>false,'msg'=>'שם חייב להיות 2-60 תווים']);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_exit(400, ['ok'=>false,'msg'=>'אימייל לא תקין']);
if (strlen($pass) < 6) json_exit(400, ['ok'=>false,'msg'=>'סיסמה חייבת להיות לפחות 6 תווים']);

$pdo = db();

$st = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$st->execute([$email]);
if ($st->fetch()) json_exit(409, ['ok'=>false,'msg'=>'האימייל כבר קיים']);

$hash = password_hash($pass, PASSWORD_DEFAULT);
$st = $pdo->prepare('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)');
$st->execute([$name, $email, $hash]);

$userId = (int)$pdo->lastInsertId();
$_SESSION['user'] = ['id'=>$userId, 'name'=>$name, 'email'=>$email];

json_exit(200, ['ok'=>true,'msg'=>'נרשמת בהצלחה', 'user'=>$_SESSION['user']]);
