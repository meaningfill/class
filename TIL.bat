@echo off
REM =====================================================
REM TIL(Today I Learned) 자동 생성 스크립트
REM 사용법: 더블클릭 실행 -> 자동으로 TIL/YYMMDD.md 생성
REM 실행 빈도: 매일 (하루 작업 끝)
REM 템플릿: # YYMMDD, ## 오늘 한 것, ## 내일 할 것, ## 이슈
REM =====================================================
chcp 65001 >nul

REM 날짜 형식: YYMMDD
set today=%date:~2,2%%date:~5,2%%date:~8,2%

REM TIL 폴더 없으면 생성
if not exist "TIL" mkdir TIL

REM 파일명
set filename=TIL\%today%.md

REM 이미 파일 있으면 열기만
if exist "%filename%" (
    echo 이미 오늘 TIL이 있습니다. 파일을 엽니다.
    start "" "%filename%"
    pause
    exit
)

REM 템플릿으로 파일 생성
(
echo # YYMMDD
echo.
echo ## 오늘 한 것
echo.
echo ## 내일 할 것
echo.
echo ## 이슈
) > "%filename%"

echo ✅ TIL/%today%.md 생성 완료!
start "" "%filename%"
pause