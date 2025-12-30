# GitHub Secrets 配置说明

在部署前，需要在 GitHub 仓库中配置以下 Secrets。

## 配置步骤

1. 进入 GitHub 仓库页面
2. 点击 `Settings` > `Secrets and variables` > `Actions`
3. 点击 `New repository secret` 添加以下密钥

## 必需的 Secrets

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `SERVER_IP` | 服务器 IP 地址 | `123.45.67.89` |
| `SERVER_DOMAIN` | 服务器域名 | `example.com` |
| `SSH_USER` | SSH 登录用户名 | `ubuntu` 或 `root` |
| `SSH_PRIVATE_KEY` | SSH 私钥内容 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

## Secrets 详细说明

### SERVER_IP

服务器的公网 IP 地址。

**获取方式:**
```bash
# 在服务器上运行
curl ifconfig.me
```

### SERVER_DOMAIN

指向服务器的域名。

**要求:**
- 域名已正确解析到服务器 IP
- DNS 记录类型: A 记录

### SSH_USER

用于 SSH 登录服务器的用户名。

**建议:**
- 使用具有 sudo 权限的普通用户（如 `ubuntu`）
- 避免使用 `root` 用户

### SSH_PRIVATE_KEY

用于 SSH 登录服务器的私钥内容。

**生成方式:**

1. 在本地生成 SSH 密钥对:
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_deploy_key
```

2. 将公钥添加到服务器:
```bash
ssh-copy-id -i ~/.ssh/github_deploy_key.pub user@your-server-ip
```

3. 复制私钥内容:
```bash
cat ~/.ssh/github_deploy_key
```

4. 将私钥内容粘贴到 GitHub Secret 中

**注意:**
- 私钥应包含完整的 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----` 行
- 不要在私钥中添加额外的空格或换行

## 可选的 Secrets

| Secret 名称 | 说明 | 默认值 |
|------------|------|--------|
| `DEPLOY_PATH` | 服务器上的部署路径 | `/var/www/one-language` |
| `NODE_VERSION` | Node.js 版本 | `18.x` |

## 服务器配置

### 1. 确保 SSH 服务已启动

```bash
sudo systemctl status ssh
```

### 2. 配置 SSH 允许密钥认证

编辑 `/etc/ssh/sshd_config`:
```bash
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
```

重启 SSH 服务:
```bash
sudo systemctl restart ssh
```

### 3. 确保 SSH 用户有 sudo 权限

将用户添加到 sudo 组:
```bash
sudo usermod -aG sudo username
```

### 4. 配置 sudo 免密码 (可选)

编辑 `/etc/sudoers`:
```bash
username ALL=(ALL) NOPASSWD: ALL
```

## 测试 SSH 连接

在本地测试 SSH 连接:

```bash
ssh -i ~/.ssh/github_deploy_key user@your-server-ip
```

如果连接成功，说明配置正确。

## 安全建议

1. **使用专用的部署密钥**
   - 不要使用个人 SSH 密钥
   - 为 GitHub Actions 生成单独的密钥对

2. **限制密钥权限**
   - 在服务器上为部署用户设置最小必要权限
   - 密钥仅用于部署，不用于其他操作

3. **定期轮换密钥**
   - 定期更换 SSH 密钥
   - 删除不再使用的密钥

4. **监控访问日志**
   - 定期检查 `/var/log/auth.log`
   - 发现异常访问及时处理

5. **使用 GitHub Environments**
   - 为生产环境配置保护规则
   - 需要手动批准才能部署

## 故障排查

### SSH 连接失败

1. 检查服务器 IP 是否正确
2. 检查 SSH 服务是否运行
3. 检查防火墙规则
4. 检查密钥是否正确添加到服务器

### 部署失败

1. 检查 GitHub Actions 日志
2. 检查服务器磁盘空间
3. 检查 Node.js 和 npm 版本
4. 检查数据库连接

### 权限错误

1. 确保 SSH 用户有 sudo 权限
2. 检查文件和目录权限
3. 检查 Nginx 配置文件权限

## 相关文档

- [部署文档](../DEPLOYMENT.md)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [SSH 密钥管理](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
