<?php
// php/config.php
declare(strict_types=1);

define('DB_HOST', 'localhost');
define('DB_NAME', 'paulawais_examix');
define('DB_USER', 'paulawais_em');
define('DB_PASS', ''); // עדכן לפי XAMPP/WAMP

// Session hardening (בסיסי)
ini_set('session.cookie_httponly', '1');
ini_set('session.use_strict_mode', '1');
// אם עובדים על HTTPS בלבד אפשר להפעיל:
// ini_set('session.cookie_secure', '1');
