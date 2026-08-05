@echo off
chcp 65001 > nul
title Auto Update Enterprise OT Portal
echo ===================================================
echo   กำลังอัปเดตระบบ Enterprise OT Portal อัตโนมัติ...
echo ===================================================
cd /d "C:\Users\ssrwj\Documents\antigravity\mysterious-einstein"
if exist db.json del /f /q db.json
git fetch origin
git reset --hard origin/main
echo.
echo ===================================================
echo  [SUCCESS] อัปเดตโค้ดเป็นเวอร์ชันล่าสุดเรียบร้อยแล้ว!
echo ===================================================
timeout /t 3
