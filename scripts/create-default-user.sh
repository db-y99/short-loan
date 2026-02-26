#!/bin/bash

# Script tạo tài khoản mặc định
echo "=== Tạo tài khoản mặc định ==="
echo ""
echo "Email: admin@y99.com"
echo "Password: Admin@123"
echo "Họ tên: Admin Y99"
echo ""

# Chạy script với input tự động
echo -e "admin@y99.com\nAdmin@123\nAdmin Y99" | pnpm create-user
