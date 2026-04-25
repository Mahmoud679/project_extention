<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

function out(int $code, array $data){
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

$subject = trim($_POST['subject'] ?? '');
$grade   = trim($_POST['grade'] ?? '');
$topic   = trim($_POST['topic'] ?? '');
$versions = (int)($_POST['versions'] ?? 0);
$shuffle = trim($_POST['shuffle_mode'] ?? '');
$duration = (int)($_POST['duration_minutes'] ?? 0);
$pdfName = trim($_POST['pdf_name'] ?? '');

if (mb_strlen($subject) < 2) out(400, ['ok'=>false,'msg'=>'מקצוע קצר מדי']);
if (!preg_match('/^(ז|ח|ט|י|יא|יב|7|8|9|10|11|12)$/u', $grade)) out(400, ['ok'=>false,'msg'=>'כיתה לא תקינה']);
if (mb_strlen($topic) < 2) out(400, ['ok'=>false,'msg'=>'נושא קצר מדי']);
if ($versions < 2 || $versions > 10) out(400, ['ok'=>false,'msg'=>'מספר גרסאות 2–10 בלבד']);
if (!in_array($shuffle, ['questions','answers','both'], true)) out(400, ['ok'=>false,'msg'=>'Shuffle לא תקין']);
if ($duration < 5 || $duration > 300) out(400, ['ok'=>false,'msg'=>'זמן 5–300 דקות']);
if ($pdfName === '' || !preg_match('/\.pdf$/i', $pdfName)) out(400, ['ok'=>false,'msg'=>'יש לבחור PDF']);

try{
  $pdo = db();
  $st = $pdo->prepare("INSERT INTO exams (subject,grade,topic,versions,shuffle_mode,duration_minutes,pdf_name)
                       VALUES (?,?,?,?,?,?,?)");
  $st->execute([$subject,$grade,$topic,$versions,$shuffle,$duration,$pdfName]);

  out(200, ['ok'=>true,'msg'=>'נשמר למסד ✅','id'=>(int)$pdo->lastInsertId()]);
}catch(Throwable $e){
  out(500, ['ok'=>false,'msg'=>'שגיאת שרת','error'=>$e->getMessage()]);
}
