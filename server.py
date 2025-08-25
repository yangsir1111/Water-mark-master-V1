#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple HTTP Server for Watermark App
Usage: python server.py
Then open http://localhost:8000 in your browser
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🚀 水印大师服务器已启动")
            print(f"📍 本地地址: http://localhost:{PORT}")
            print(f"📍 独立版本: http://localhost:{PORT}/watermark-standalone.html")
            print(f"📍 React版本: http://localhost:{PORT}/index.html")
            print(f"按 Ctrl+C 停止服务器")
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{PORT}/watermark-standalone.html')
                print("✅ 已自动打开浏览器")
            except:
                print("⚠️ 无法自动打开浏览器，请手动访问上述地址")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except OSError as e:
        if e.errno == 10048:  # Port already in use
            print(f"❌ 端口 {PORT} 已被占用，请关闭其他应用或更改端口号")
        else:
            print(f"❌ 启动服务器时出错: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()