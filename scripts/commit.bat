@echo off
REM =====================================================
REM 커밋 자동화 스크립트
REM 사용법: 더블클릭 실행 -> 파일명 입력 -> Commitizen 대화형 진행
REM 실행 빈도: 매번 (코드 작업 후마다)
REM =====================================================
chcp 65001 >nul
echo ================================
echo Changed files:
echo ================================
git status -s
echo.
echo ================================
set /p files="Enter files to commit (space-separated): "
git add %files%
echo.
git cz