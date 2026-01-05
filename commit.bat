@echo off
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