<?php
/*
 * AAT World newsletter sign-up (the "اشترك" box in the footer).
 * Receives {"email": "...", "lang": "ar"} by POST, keeps the address in api/data/subscribers.csv
 * (the folder is closed to the web by its .htaccess) and e-mails the office about each new subscriber.
 * The list can be downloaded from Hostinger File Manager: public_html/api/data/subscribers.csv
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const NOTIFY = 'info@aatworld.com';   // who is told about each new subscriber
const MAX_PER_HOUR = 5;               // sign-ups allowed from one connection per hour (stops bots)

function done($code, $ok) { http_response_code($code); echo json_encode(['ok' => $ok]); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { done(405, false); }

$in = json_decode((string) file_get_contents('php://input', false, null, 0, 2000), true);
$email = is_array($in) ? trim((string) ($in['email'] ?? '')) : '';
$lang = is_array($in) ? substr(preg_replace('/[^a-zA-Z-]/', '', (string) ($in['lang'] ?? '')), 0, 8) : '';
if ($email === '' || strlen($email) > 160 || !filter_var($email, FILTER_VALIDATE_EMAIL)) { done(400, false); }

$dir = __DIR__ . '/data';
if (!is_dir($dir)) { @mkdir($dir, 0750, true); }
if (!is_file($dir . '/.htaccess')) { @file_put_contents($dir . '/.htaccess', "Require all denied\n"); }

// a few sign-ups per connection per hour
$rate = $dir . '/rate-' . substr(hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? '')), 0, 16) . '.txt';
$now = time();
$times = is_file($rate) ? array_filter(array_map('intval', explode(',', (string) file_get_contents($rate))), function ($t) use ($now) { return $t > $now - 3600; }) : [];
if (count($times) >= MAX_PER_HOUR) { done(429, false); }
$times[] = $now;
@file_put_contents($rate, implode(',', $times), LOCK_EX);

// keep each address once
$csv = $dir . '/subscribers.csv';
$known = is_file($csv) ? strtolower((string) file_get_contents($csv)) : '';
if (strpos($known, ',' . strtolower($email) . ',') !== false) { done(200, true); }
if (!is_file($csv)) { @file_put_contents($csv, "date,email,language\n", LOCK_EX); }
if (@file_put_contents($csv, gmdate('Y-m-d H:i') . ',' . $email . ',' . $lang . "\n", FILE_APPEND | LOCK_EX) === false) { done(500, false); }

// tell the office (the address was checked above, so it cannot carry extra mail headers)
@mail(NOTIFY, 'New newsletter subscriber / مشترك جديد في النشرة',
    "New subscriber: $email\nLanguage: $lang\nTime (UTC): " . gmdate('Y-m-d H:i') . "\n\nAll subscribers: public_html/api/data/subscribers.csv",
    "From: AAT World <noreply@aatworld.com>\r\nContent-Type: text/plain; charset=UTF-8");

done(200, true);
