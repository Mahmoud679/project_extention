EXAMIX - עדכון עם PHP (Login/Register) + NAV שם משתמש

מה חדש?
- התחברות והרשמה אמיתיים דרך php/auth_login.php + php/auth_register.php
- שימוש ב-SESSION
- NAV מתעדכן אוטומטית: "התחברות" -> "שלום, <שם>" + "התנתקות"

התקנה (XAMPP/WAMP):
1) העתק את כל התיקייה examix לתוך htdocs (XAMPP):
   C:\xampp\htdocs\examix

2) צור DB בשם examix והרץ את ה-SQL:

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

3) עדכן פרטי DB בקובץ:
   php/config.php

4) פתח בדפדפן:
   http://localhost/examix/index.html

הערה:
- מסכים 1-4 עדיין עובדים כ-DEMO (localStorage). ההתחברות היא אמיתית.
