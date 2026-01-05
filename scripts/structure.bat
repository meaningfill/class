@echo off
REM =====================================================
REM 프로젝트 폴더 구조 트리 생성 스크립트
REM 사용법: 더블클릭 실행 -> project-structure.txt 생성
REM 실행 빈도: 가끔 (README 업데이트 시, 구조 파악 필요시)
REM 제외 항목: node_modules, .git, dist, build, .env
REM =====================================================
chcp 65001 >nul
echo 프로젝트 구조 생성 중...
tree /F /A | findstr /V "node_modules .git dist build .env" > project-structure.txt
echo.
echo ✅ project-structure.txt 파일 생성 완료!
echo.
pause