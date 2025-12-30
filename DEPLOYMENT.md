# One-Language 部署文档

本文档介绍如何在 Ubuntu 22.04 服务器上部署 One-Language 项目。

## 目录

- [环境配置](#环境配置)
- [GitHub Actions 自动部署](#github-actions-自动部署)
- [系统要求](#系统要求)
- [前置准备](#前置准备)
- [服务器环境配置](#服务器环境配置)
- [数据库配置](#数据库配置)
- [后端部署](#后端部署)
- [管理后台部署](#管理后台部署)
- [Nginx 反向代理配置](#nginx-反向代理配置)
- [SSL 证书配置](#ssl-证书配置)
- [进程管理](#进程管理)
- [监控与日志](#监控与日志)
- [故障排查](#故障排查)

## 环境配置

项目使用不同的环境配置文件区分开发和生产环境：

| 文件 | 用途 | 说明 |
|------|------|------|
| `.env` | 默认配置 | 被 `.gitignore` 忽略，本地使用 |
| `.env.example` | 配置模板 | 提交到 Git，供参考 |
| `.env.development` | 开发环境 | `npm run dev` 时自动加载 |
| `.env.production` | 生产环境 | `npm run build` 时自动加载 |

### 扩展环境变量

```env
# AI API 配置 (翻译服务)
VITE_WXT_DEFAULT_API_ENDPOINT="https://api.siliconflow.cn/v1/chat/completions"
VITE_WXT_DEFAULT_API_KEY="your-api-key-here"
VITE_WXT_DEFAULT_MODEL="Qwen/Qwen3-Next-80B-A3B-Instruct"
VITE_WXT_DEFAULT_TEMPERATURE="0.2"

# 后端 API 地址
# 开发环境: http://localhost:3011
# 生产环境: https://admin.1zhizu.com
VITE_BACKEND_API_ENDPOINT="https://admin.1zhizu.com"
```

### 构建命令

```bash
# 开发模式 (使用 .env.development)
npm run dev

# 生产构建 (使用 .env.production)
npm run build
npm run zip              # 打包 Chrome 扩展
npm run zip:firefox      # 打包 Firefox 扩展
npm run zip:all          # 打包所有浏览器
```

## GitHub Actions 自动部署

项目配置了 GitHub Actions 自动部署，推送到 `master` 分支时自动部署到生产服务器。

### 配置 GitHub Secrets

在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：

| Secret 名称 | 说明 | 示例 |
|-------------|------|------|
| `SSH_PRIVATE_KEY` | 服务器 SSH 私钥 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_USER` | SSH 登录用户名 | `root` |
| `SERVER_IP` | 服务器 IP 地址 | `120.26.90.169` |

### 生成 SSH 密钥

在服务器上执行：

```bash
# 生成密钥对
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/deploy_key

# 将公钥添加到 authorized_keys
cat ~/deploy_key.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 查看私钥 (复制到 GitHub Secrets)
cat ~/deploy_key
```

### 部署流程

1. 推送代码到 `master` 分支
2. GitHub Actions 自动触发
3. 构建后端和管理后台
4. 通过 SSH 部署到服务器
5. 重启 PM2 和 Nginx

### 手动触发部署

在 GitHub Actions 页面点击 "Run workflow" 可手动触发部署。

## 系统要求

- 操作系统: Ubuntu 22.04 LTS
- CPU: 2 核心以上
- 内存: 4GB 以上
- 磁盘: 20GB 以上
- Node.js: >= 18.x
- PostgreSQL: >= 14.x
- Nginx: >= 1.18.x

## 前置准备

### 1. 更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. 安装必要工具

```bash
sudo apt install -y curl wget git vim ufw
```

### 3. 配置防火墙

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## 服务器环境配置

### 1. 安装 Node.js 18.x

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

### 2. 安装 PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib

# 启动 PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 验证安装
sudo -u postgres psql --version
```

### 3. 创建数据库和用户

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 执行以下 SQL 命令
CREATE DATABASE one_language;
CREATE USER one_language_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE one_language TO one_language_user;
ALTER DATABASE one_language OWNER TO one_language_user;
\q
```

### 4. 安装 Nginx

```bash
sudo apt install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. 安装 PM2 (进程管理)

```bash
sudo npm install -g pm2

# 设置 PM2 开机自启
pm2 startup
# 执行输出的命令
```

## 数据库配置

### 1. 克隆项目

```bash
cd /var/www
sudo git clone <your-repository-url> one-language
sudo chown -R $USER:$USER one-language
cd one-language
```

### 2. 配置后端环境变量

```bash
cd backend
cp .env.example .env
vim .env
```

编辑 `.env` 文件:

```env
# 数据库配置
DATABASE_URL="postgresql://one_language_user:your_secure_password@localhost:5432/one_language"

# JWT 配置
JWT_SECRET="your_jwt_secret_key_min_32_chars"
JWT_REFRESH_SECRET="your_refresh_secret_key_min_32_chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# 服务器配置
PORT=3000
NODE_ENV=production

# CORS 配置
CORS_ORIGIN="https://your-domain.com"
```

### 3. 安装依赖并初始化数据库

```bash
cd /var/www/one-language/backend
npm install

# 生成 Prisma 客户端
npm run db:generate

# 运行数据库迁移
npm run db:migrate:prod

# 可选: 填充初始数据
npm run db:seed
```

## 后端部署

### 1. 构建后端

```bash
cd /var/www/one-language/backend
npm run build
```

### 2. 使用 PM2 启动后端服务

```bash
cd /var/www/one-language/backend
pm2 start dist/index.js --name one-language-backend

# 保存 PM2 配置
pm2 save

# 查看状态
pm2 status
pm2 logs one-language-backend
```

### 3. 验证后端服务

```bash
curl http://localhost:3000/api/health
```

## 管理后台部署

### 1. 配置前端环境变量

```bash
cd /var/www/one-language/admin
cp .env.example .env
vim .env
```

编辑 `.env` 文件:

```env
VITE_API_BASE_URL=https://your-domain.com/api
```

### 2. 安装依赖并构建

```bash
cd /var/www/one-language/admin
npm install
npm run build
```

### 3. 配置 Nginx

创建 Nginx 配置文件:

```bash
sudo vim /etc/nginx/sites-available/one-language
```

添加以下配置:

```nginx
# 后端 API 反向代理
server {
    listen 80;
    server_name your-domain.com;

    # 管理后台静态文件
    location / {
        root /var/www/one-language/admin/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存配置
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

### 4. 启用站点配置

```bash
sudo ln -s /etc/nginx/sites-available/one-language /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## SSL 证书配置

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

Certbot 会自动更新 Nginx 配置，添加 SSL 支持。

### 手动 SSL 配置 (可选)

如果使用自己的 SSL 证书，更新 Nginx 配置:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 其他配置保持不变...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 进程管理

### PM2 常用命令

```bash
# 查看所有进程
pm2 list

# 查看日志
pm2 logs one-language-backend

# 查看实时日志
pm2 logs one-language-backend --lines 100

# 重启服务
pm2 restart one-language-backend

# 停止服务
pm2 stop one-language-backend

# 删除服务
pm2 delete one-language-backend

# 监控
pm2 monit
```

### PM2 配置文件

创建 PM2 配置文件 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'one-language-backend',
    script: './dist/index.js',
    cwd: '/var/www/one-language/backend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/one-language-backend-error.log',
    out_file: '/var/log/pm2/one-language-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G'
  }]
};
```

使用配置文件启动:

```bash
pm2 start ecosystem.config.js
```

## 监控与日志

### 1. 应用日志

```bash
# PM2 日志目录
ls -la /var/log/pm2/

# 实时查看日志
tail -f /var/log/pm2/one-language-backend-out.log
tail -f /var/log/pm2/one-language-backend-error.log
```

### 2. Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

### 3. PostgreSQL 日志

```bash
# 查看日志
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 4. 系统监控

```bash
# CPU 和内存使用
htop

# 磁盘使用
df -h

# 网络连接
netstat -tulpn
```

## 更新部署

### 1. 更新代码

```bash
cd /var/www/one-language
git pull origin main
```

### 2. 更新后端

```bash
cd /var/www/one-language/backend
npm install
npm run build
npm run db:migrate:prod
pm2 restart one-language-backend
```

### 3. 更新管理后台

```bash
cd /var/www/one-language/admin
npm install
npm run build
```

### 4. 重启 Nginx

```bash
sudo systemctl reload nginx
```

## 备份策略

### 1. 数据库备份

创建备份脚本 `/var/www/one-language/scripts/backup-db.sh`:

```bash
#!/bin/bash

# 配置
BACKUP_DIR="/var/backups/one-language"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="one_language"
DB_USER="one_language_user"
RETENTION_DAYS=7

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# 删除旧备份
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
```

设置定时任务:

```bash
chmod +x /var/www/one-language/scripts/backup-db.sh

# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点执行备份
0 2 * * * /var/www/one-language/scripts/backup-db.sh
```

### 2. 文件备份

```bash
# 备份上传文件
tar -czf /var/backups/one-language/uploads_$(date +%Y%m%d).tar.gz /var/www/one-language/uploads
```

## 故障排查

### 1. 后端服务无法启动

```bash
# 检查 PM2 日志
pm2 logs one-language-backend

# 检查端口占用
sudo netstat -tulpn | grep 3000

# 手动运行测试
cd /var/www/one-language/backend
node dist/index.js
```

### 2. 数据库连接失败

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 测试连接
psql -U one_language_user -h localhost -d one_language

# 检查防火墙
sudo ufw status
```

### 3. Nginx 502 错误

```bash
# 检查后端服务是否运行
pm2 status

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 4. 静态文件 404

```bash
# 检查文件权限
ls -la /var/www/one-language/admin/dist

# 检查 Nginx 配置中的路径
cat /etc/nginx/sites-available/one-language
```

## 安全建议

1. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **使用强密码**
   - 数据库密码
   - JWT 密钥 (至少 32 字符)

3. **限制 SSH 访问**
   ```bash
   # 禁用 root 登录
   sudo vim /etc/ssh/sshd_config
   # 设置: PermitRootLogin no
   sudo systemctl restart sshd
   ```

4. **配置 fail2ban**
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

5. **定期备份数据**
   - 数据库备份
   - 配置文件备份

6. **监控服务器资源**
   - 设置告警通知
   - 定期检查日志

## 性能优化

### 1. Nginx 优化

```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 1024;

http {
    # 启用缓存
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

    # 其他优化...
}
```

### 2. PostgreSQL 优化

编辑 `/etc/postgresql/14/main/postgresql.conf`:

```ini
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
```

重启 PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 3. Node.js 优化

- 使用 PM2 集群模式
- 启用 gzip 压缩
- 配置 CDN 加速静态资源

## 联系支持

如遇到部署问题，请查看:
- 项目 GitHub Issues
- 技术文档: `/docs`
- 后端日志: `/var/log/pm2/`
- Nginx 日志: `/var/log/nginx/`
