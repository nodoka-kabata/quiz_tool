# CAIND QUIZ SYSTEM

ニコ生番組「CAIND」で使用するために開発したテレビクイズ番組風の回答表示システムです。
一部の機能を省いて公開してみます。
なお要件だけ適当にまとめてコードはだいたいAI(Github Copilot)に書かせました。
ロリポップのWebサーバで動かせるようにphpをメインとした仕様になってます。
なおまだ調整中の部分があるので平気でバグったり仕様が変更されることがあります。

以下 AIに書かせました

## 🎯 主な機能

### 回答者向け機能
- 名前登録システム
- リアルタイム待機状態表示
- 解答入力・送信機能
- ハートビート機能（接続状態維持）

### 管理者向け機能
- 解答記入の開始/締切制御
- 回答者のキック機能
- 回答の表示/非表示切り替え
- 回答者の表示順序変更（ドラッグ&ドロップ）
- 複数管理者間での状態同期
- システムリセット機能

### OBS配信向け機能
- 16:9グリッドレイアウト表示
- テレビクイズ番組風デザイン
- 回答と名前の分離表示
- リアルタイム更新

## 🛠️ 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **バックエンド**: PHP 7.4+
- **データベース**: MySQL
- **管理ツール**: phpMyAdmin
- **外部ライブラリ**: 
  - Font Awesome 6.0
  - SortableJS 1.15.0

## 📁 ディレクトリ構造

```
quiz_tool/
├── index.html          # 回答者画面
├── admin.html          # 管理者画面
├── obs.html           # OBS表示画面
├── api/               # APIエンドポイント
│   ├── admin.php      # 管理者操作API
│   ├── answer.php     # 回答送信・取得API
│   ├── db.php         # データベース接続
│   ├── debug_setup.php # デバッグ設定
│   ├── heartbeat.php  # ハートビートAPI
│   ├── obs.php        # OBS表示データAPI
│   ├── ping.php       # 疎通確認API
│   ├── register.php   # 回答者登録API
│   └── users.php      # ユーザー一覧API
├── public/
│   ├── css/           # スタイルシート
│   │   ├── style.css
│   │   └── obs.css
│   └── js/            # JavaScript
│       ├── main.js
│       ├── admin.js
│       ├── obs.js
│       └── debug.js
├── sql/               # データベーススキーマ
│   ├── schema.sql
│   └── debug_queries.sql
└── watch_logs.bat     # ログ監視用バッチファイル
```

## 🚀 セットアップ

### 1. 環境要件
- PHP 7.4 以上
- MySQL 5.7 以上
- Webサーバー（Apache/Nginx）

### 2. データベース設定
```sql
-- MySQLでデータベースを作成
CREATE DATABASE `quiz-app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

`sql/schema.sql`を実行してテーブルを作成してください。

### 3. データベース接続設定
`api/db.php`でデータベース接続情報を設定：
```php
$host = 'localhost';
$db   = 'quiz-app';
$user = 'root';
$pass = '';
```

### 4. Webサーバー設定
プロジェクトディレクトリをWebサーバーのドキュメントルートに配置するか、仮想ホストを設定してください。

## 📱 使用方法

### 回答者
1. `index.html`にアクセス
2. 名前を登録
3. 管理者の開始を待機
4. 解答を入力・送信

### 管理者
1. `admin.html`にアクセス
2. 回答者の登録状況を確認
3. 「解答記入開始」ボタンで開始
4. 回答を確認し「締切」ボタンで終了
5. 必要に応じて回答の表示/非表示を切り替え
6. 「リセット」で初期状態に戻る

### OBS配信
1. `obs.html`をOBSのブラウザソースに追加
2. 16:9の解像度で表示
3. 管理者が締切後、自動的に回答が表示される

## 🔧 デバッグ機能

- デバッグログ: `debug.log`に出力
- ログ監視: `watch_logs.bat`を実行
- エラーハンドリング: 全APIでJSONエラーレスポンス対応

## 🎨 カスタマイズ

### OBS表示のカスタマイズ
`public/css/obs.css`でグリッドレイアウトやデザインを変更できます。

### 色・テーマの変更
`public/css/style.css`のCSS変数を変更することで全体のカラーテーマを調整できます。


## 📞 サポート

問題や質問がございましたら、GitHubのIssuesページでお知らせください。
