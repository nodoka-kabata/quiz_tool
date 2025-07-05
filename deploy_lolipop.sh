#!/bin/bash
# ロリポップ用デプロイメントスクリプト

echo "🚀 CAIND QUIZ SYSTEM - ロリポップデプロイメント開始"
echo "=================================================="

# 現在のディレクトリを確認
if [ ! -f "version.json" ]; then
    echo "❌ エラー: quiz_toolのルートディレクトリから実行してください"
    exit 1
fi

# バックアップディレクトリ作成
BACKUP_DIR="deploy_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 デプロイ用ファイルを準備中..."

# 本番用ファイルのコピー
cp .htaccess.lolipop .htaccess.deploy
cp .env.example .env.deploy

# 除外ファイルリスト
EXCLUDE_LIST=(
    ".git"
    ".github"
    "*.log"
    "*.bat"
    "*.ps1"
    "setup_database.*"
    "check_environment.*"
    "backup_database.*"
    ".htaccess.new"
    ".htaccess.lolipop"
    "backups"
    "deploy_backup_*"
    "config/lolipop_config.php"
    "*.tmp"
    "node_modules"
    ".DS_Store"
    "Thumbs.db"
)

echo "🗜️  アーカイブを作成中..."

# Tarアーカイブ作成（除外ファイル付き）
TAR_EXCLUDE=""
for item in "${EXCLUDE_LIST[@]}"; do
    TAR_EXCLUDE="$TAR_EXCLUDE --exclude=$item"
done

tar $TAR_EXCLUDE -czf "${BACKUP_DIR}/quiz_tool_lolipop.tar.gz" \
    --transform 's|\.htaccess\.deploy|\.htaccess|' \
    --transform 's|\.env\.deploy|\.env|' \
    .

echo "✅ アーカイブ作成完了: ${BACKUP_DIR}/quiz_tool_lolipop.tar.gz"

# FTPアップロード用の説明
cat << EOF

📋 ロリポップへのアップロード手順:
==================================

1. ロリポップのFTPまたはファイルマネージャーにログイン
2. 作成されたアーカイブをダウンロード: ${BACKUP_DIR}/quiz_tool_lolipop.tar.gz
3. ロリポップのドキュメントルートにアップロード
4. アーカイブを展開
5. .env ファイルでデータベース情報を設定
6. ロリポップのphpMyAdminでデータベースとテーブルを作成

📝 必要な設定:
- データベース名: LAA0123456-quiztool
- .env ファイルの編集
- .htaccess の確認

🔗 確認URL:
- メインページ: https://your-domain.lolipop.io/
- API テスト: https://your-domain.lolipop.io/api/test.php
- DB確認: https://your-domain.lolipop.io/api/db_check.php

EOF

# クリーンアップ
rm -f .htaccess.deploy .env.deploy

echo "🎉 デプロイ準備完了!"
