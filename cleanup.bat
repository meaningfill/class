@echo off
REM =====================================================
REM 프로젝트 폴더 정리 스크립트
REM 사용법: 더블클릭 실행
REM 실행 빈도: 드물게 (폴더 구조 엉망일 때만)
REM 작업 내용:
REM   - scripts/ 폴더에 .bat 파일 이동
REM   - 불필요한 임시 파일 삭제
REM =====================================================
chcp 65001 >nul
echo 프로젝트 정리 시작...

REM scripts 폴더 생성
if not exist "scripts" mkdir scripts

REM .bat 파일들 이동
move "커밋.bat" "scripts\" 2>nul
move "commit.bat" "scripts\" 2>nul
move "structure.bat" "scripts\" 2>nul
move "TIL작성.bat" "scripts\" 2>nul
move "create-til.bat" "scripts\" 2>nul

REM 불필요한 파일 삭제
del "작업기록.bat" 2>nul
del "project-structure.txt" 2>nul

echo ✅ 정리 완료!
echo - scripts/ 폴더에 .bat 파일 이동
echo - 불필요한 파일 삭제
pause