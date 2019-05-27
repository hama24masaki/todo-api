# todo-api

## 概要

タスク管理のためのAPI  
技術的要素としては以下
- Node.js Ver.8系以上
  - async/await 記法は使用していない
- 永続化層はSqlite3＋Sequelize
- テストはMocha＋Chai
- API定義はAPI-Blueprint＋Aglio

Production環境は用意しない。想定環境は以下
- development：通常の動作検証用
- test：テスト専用
  

## 機能概要

1. ユーザ登録/認証用とタスク管理用の2群から成る。
2. ユーザ登録/認証API
   1. ユーザ登録はメールアドレスとパスワードを持って行い、APIはアクセストークンを返却する。
   2. ユーザ認証も同上。
   3. アクセストークンに有効期間は設けない
      1. 但し新たにサインインした際には、古いトークンは破棄される。
      2. 認証機構は外部API（FirebaseAuth等）と差し替える事も想定し、最低限の機能のみ実装する。
3. タスク管理API
   1. タスク管理APIへのアクセスは、アクセストークンが必須。
   2. タスクは本文、タイトル（任意）、作成日時（および更新日時）から成る
   3. クライアントが非同期動作する事を想定し、タスクの作成日時等はクライアントから指定する事も可能とする。

## 参照資料

### API定義

- [GitHub page](https://hama24masaki.github.io/todo-api/api.html) ( Source is [docs/api.html](https://github.com/hama24masaki/todo-api/blob/master/docs/api.html) )

### テスト

#### テストコード
- [test/tests.js](https://github.com/hama24masaki/todo-api/blob/master/test/tests.js)

#### テスト結果
- [GitHub page](https://hama24masaki.github.io/todo-api/test_result.html) ( Source is [docs/test_result.html](https://github.com/hama24masaki/todo-api/blob/master/docs/test_result.html) )

## 環境構築等手順

1. node.jsとnpmとGitはインストール済みの前提
2. チェックアウトしてDir内で `npm install`
3. サーバを起動

    ```
    $ npm run migrate-dev
    $ npm start
    ```
4. テストを実行

    ```
    $ npm run migrate-test
    $ npm test
    ```

5. DBをクリア
   - 以下のファイルを物理削除する 
     - db/dev.sqlite 
     - db/test.sqlite 

