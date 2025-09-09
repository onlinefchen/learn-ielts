#!/usr/bin/env python3
"""
简单的HTTP服务器，用于本地运行词汇学习网站
"""
import http.server
import socketserver
import os

# 设置端口
PORT = 8001

# 切换到当前目录
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 创建请求处理器
Handler = http.server.SimpleHTTPRequestHandler

# 设置MIME类型，确保JSON文件正确加载
Handler.extensions_map.update({
    '.json': 'application/json',
})

# 启动服务器
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"服务器已启动！")
    print(f"请在浏览器中访问: http://localhost:{PORT}")
    print(f"按 Ctrl+C 停止服务器")
    httpd.serve_forever()