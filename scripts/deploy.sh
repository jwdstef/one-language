#!/bin/bash

# 快速部署脚本
# 用途: 快速部署 One-Language 到 Ubuntu 服务器

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 sudo 运行此脚本"
        exit 1
    fi
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    apt update && apt upgrade -y
}

# 安装基础工具
install_base_tools() {
    log_info "安装基础工具..."
    apt install -y curl wget git vim ufw htop
}

# 安装 Node.js
install_nodejs() {
    log_info "安装 Node.js 18.x..."
    
    if command -v node &> /dev/null; then
        log_warn "Node.js 已安装，跳过"
        return
    fi
    
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    log_info "Node.js 版本: $(node --version)"
    log_info "npm 版本: $(npm --version)"
}

# 安装 PostgreSQL
install_postgresql() {
    log_info "安装 PostgreSQL..."
    
    if command -v psql &> /dev/null; then
        log_warn "PostgreSQL 已安装，跳过"
        return
    fi
    
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    
    log_info "PostgreSQL 版本: $(psql --version)"
}

# 安装 Nginx
install_nginx() {
    log_info "安装 Nginx..."
    
    if command -v nginx &> /dev/null; then
        log_warn "Nginx 已安装，跳过"
        return
    fi
    
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    
    log_info "Nginx 版本: $(nginx -v 2>&1)"
}

# 安装 PM2
install_pm2() {
    log_info "安装 PM2..."
    
    if command -v pm2 &> /dev/null; then
        log_warn "PM2 已安装，跳过"
        return
    fi
    
    npm install -g pm2
    
    # 设置 PM2 开机自启
    pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    log_info "防火墙状态: $(ufw status | head -1)"
}

# 创建数据库用户和数据库
setup_database() {
    log_info "设置数据库..."
    
    read -p "请输入数据库名称 (默认: one_language): " DB_NAME
    DB_NAME=${DB_NAME:-one_language}
    
    read -p "请输入数据库用户名 (默认: one_language_user): " DB_USER
    DB_USER=${DB_USER:-one_language_user}
    
    read -sp "请输入数据库密码: " DB_PASSWORD
    echo
    
    # 创建数据库和用户
    sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
\q
EOF
    
    log_info "数据库配置完成"
    log_info "数据库名: $DB_NAME"
    log_info "用户名: $DB_USER"
}

# 克隆项目
clone_project() {
    log_info "克隆项目..."
    
    read -p "请输入 Git 仓库地址: " REPO_URL
    
    mkdir -p /var/www
    cd /var/www
    
    if [ -d "one-language" ]; then
        log_warn "项目目录已存在，请手动处理"
        return
    fi
    
    git clone $REPO_URL one-language
    chown -R $SUDO_USER:$SUDO_USER one-language
    
    log_info "项目已克隆到 /var/www/one-language"
}

# 安装项目依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    cd /var/www/one-language
    
    # 安装根目录依赖
    npm ci
    
    # 安装后端依赖
    cd backend
    npm ci
    
    # 生成 Prisma 客户端
    npm run db:generate
    
    # 安装前端依赖
    cd ../admin
    npm ci
}

# 配置环境变量
setup_env() {
    log_info "配置环境变量..."
    
    read -p "请输入服务器域名: " DOMAIN
    read -p "请输入 JWT 密钥 (至少 32 字符): " JWT_SECRET
    
    # 配置后端环境变量
    cd /var/www/one-language/backend
    cp .env.example .env
    
    cat > .env << EOF
DATABASE_URL="postgresql://one_language_user:$DB_PASSWORD@localhost:5432/one_language"
JWT_SECRET="$JWT_SECRET"
JWT_REFRESH_SECRET="${JWT_SECRET}_refresh"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=production
CORS_ORIGIN="https://$DOMAIN"
EOF
    
    # 配置前端环境变量
    cd /var/www/one-language/admin
    cp .env.example .env
    
    echo "VITE_API_BASE_URL=https://$DOMAIN/api" > .env
    
    log_info "环境变量配置完成"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    cd /var/www/one-language/backend
    npm run build
    
    cd /var/www/one-language/admin
    npm run build
    
    log_info "项目构建完成"
}

# 配置 Nginx
setup_nginx() {
    log_info "配置 Nginx..."
    
    read -p "请输入服务器域名: " DOMAIN
    
    cat > /etc/nginx/sites-available/one-language << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # 管理后台静态文件
    location / {
        root /var/www/one-language/admin/dist;
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
EOF
    
    ln -sf /etc/nginx/sites-available/one-language /etc/nginx/sites-enabled/
    
    nginx -t
    systemctl reload nginx
    
    log_info "Nginx 配置完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    cd /var/www/one-language/backend
    
    # 运行数据库迁移
    npm run db:migrate:prod
    
    # 启动 PM2 服务
    su - $SUDO_USER -c "cd /var/www/one-language/backend && pm2 start dist/index.js --name one-language-backend"
    su - $SUDO_USER -c "pm2 save"
    
    log_info "服务启动完成"
}

# 设置备份脚本
setup_backup() {
    log_info "设置自动备份..."
    
    mkdir -p /var/backups/one-language
    chmod +x /var/www/one-language/scripts/backup-db.sh
    
    # 添加到 crontab
    (crontab -l 2>/dev/null; echo "0 2 * * * /var/www/one-language/scripts/backup-db.sh") | crontab -
    
    log_info "自动备份已设置 (每天凌晨 2 点)"
}

# 显示部署信息
show_info() {
    log_info "========== 部署完成 =========="
    echo
    echo "项目路径: /var/www/one-language"
    echo "后端端口: 3000"
    echo "PM2 命令: pm2 status"
    echo "Nginx 配置: /etc/nginx/sites-available/one-language"
    echo "日志路径: /var/log/pm2/"
    echo
    log_warn "请配置 SSL 证书:"
    echo "  sudo certbot --nginx -d your-domain.com"
    echo
}

# 主函数
main() {
    log_info "========== One-Language 部署脚本 =========="
    echo
    
    check_root
    
    # 询问是否执行所有步骤
    read -p "是否执行完整部署? (y/n): " FULL_DEPLOY
    
    if [ "$FULL_DEPLOY" = "y" ]; then
        update_system
        install_base_tools
        install_nodejs
        install_postgresql
        install_nginx
        install_pm2
        configure_firewall
        setup_database
        clone_project
        install_dependencies
        setup_env
        build_project
        setup_nginx
        start_services
        setup_backup
        show_info
    else
        echo "请手动选择要执行的步骤"
        echo "1. 更新系统"
        echo "2. 安装 Node.js"
        echo "3. 安装 PostgreSQL"
        echo "4. 安装 Nginx"
        echo "5. 安装 PM2"
        echo "6. 配置防火墙"
        echo "7. 设置数据库"
        echo "8. 克隆项目"
        echo "9. 安装依赖"
        echo "10. 配置环境变量"
        echo "11. 构建项目"
        echo "12. 配置 Nginx"
        echo "13. 启动服务"
        echo "14. 设置备份"
    fi
}

# 执行主函数
main
