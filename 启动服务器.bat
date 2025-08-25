@echo off
chcp 65001 >nul
title 水印大师服务器

echo.
echo ==========================================
echo        水印大师 - 批量图片水印工具
echo ==========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Python，请先安装 Python 3.x
    echo.
    echo 下载地址: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✅ Python 已安装
echo 🚀 正在启动服务器...
echo.

REM Start the Python server
python server.py

pause