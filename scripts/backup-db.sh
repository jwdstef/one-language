#!/bin/bash

# 数据库备份脚本
# 用途: 备份 One-Language PostgreSQL 数据库

# 配置变量
BACKUP_DIR="/var/backups/one-language"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="one_language"
DB_USER="one_language_user"
DB_HOST="localhost"
RETENTION_DAYS=7

# 创建备份目录
mkdir -p $BACKUP_DIR

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 备份数据库
backup_database() {
    log "开始备份数据库: $DB_NAME"
    
    if pg_dump -U $DB_USER -h $DB_HOST $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz; then
        log "数据库备份成功: db_backup_$DATE.sql.gz"
        
        # 显示备份文件大小
        SIZE=$(du -h $BACKUP_DIR/db_backup_$DATE.sql.gz | cut -f1)
        log "备份文件大小: $SIZE"
    else
        log "数据库备份失败!"
        exit 1
    fi
}

# 清理旧备份
cleanup_old_backups() {
    log "清理 $RETENTION_DAYS 天前的旧备份"
    
    DELETED_COUNT=$(find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
    log "已删除 $DELETED_COUNT 个旧备份文件"
}

# 验证备份
verify_backup() {
    log "验证备份文件完整性"
    
    if gzip -t $BACKUP_DIR/db_backup_$DATE.sql.gz; then
        log "备份文件验证通过"
    else
        log "备份文件验证失败!"
        exit 1
    fi
}

# 主执行流程
main() {
    log "========== 数据库备份开始 =========="
    
    backup_database
    verify_backup
    cleanup_old_backups
    
    log "========== 数据库备份完成 =========="
}

# 执行主函数
main
