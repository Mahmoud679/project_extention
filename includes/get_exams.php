<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

try{
  $pdo = db();
  $rows = $pdo->query("SELECT id,subject,grade,topic,versions,shuffle_mode,duration_minutes,pdf_name,created_at
                       FROM exams ORDER BY created_at DESC LIMIT 200")->fetchAll();
  echo json_encode(['ok'=>true,'items'=>$rows], JSON_UNESCAPED_UNICODE);
}catch(Throwable $e){
  http_response_code(500);
  echo json_encode(['ok'=>false,'msg'=>'שגיאת שרת','error'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
}
