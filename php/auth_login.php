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

$email = strtolower(trim($_POST['email'] ?? ''));
$pass  = (string)($_POST['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_exit(400, ['ok'=>false,'msg'=>'אימייל לא תקין']);
if (strlen($pass) < 6) json_exit(400, ['ok'=>false,'msg'=>'סיסמה חייבת להיות לפחות 6 תווים']);

$pdo = db();
$st = $pdo->prepare('SELECT id,name,email,password_hash FROM users WHERE email = ?');
$st->execute([$email]);
$user = $st->fetch();

if (!$user || !password_verify($pass, $user['password_hash'])) {
  json_exit(401, ['ok'=>false,'msg'=>'אימייל/סיסמה לא נכונים']);
}

$_SESSION['user'] = ['id'=>(int)$user['id'], 'name'=>$user['name'], 'email'=>$user['email']];
json_exit(200, ['ok'=>true,'msg'=>'התחברת', 'user'=>$_SESSION['user']]);
