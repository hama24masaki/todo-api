FORMAT: 1A

# Todo-App API
TODOアプリ用API。


# Data Structures

## TaskData
+ id: 1 (required, number) - Unique identifier
+ title: タスクのタイトル (string, optional) - Single line description
+ body: タスク本文 (string, required)


## TaskList (array)
+ (TaskData)


# Group Users

## User Collection Endpoint [/beta-v1/users]

### ユーザ新規作成（サインアップ） [POST]

* メールアドレスとパスワードでユーザアカウントを作成する。
* 作成出来たらアクセストークンが返却される。

+ Request (application/json)

    + Attributes
        + email: test@example.com (string, required) - メールアドレス
        + password: abc123 (string, required) - パスワード

+ Response 201 (application/json)

    + Attributes
        + accessToken: f58ba22059f5a8aa8f346e0f40987adab326041fac99029c909bef2c6300821a (string, required) - アクセストークン

+ Response 400 (application/json)

    + Body

            {
                "error": "Invalid arguments",
                "message": "Assigned email is already exists.",
            }


## User Authentication Endpoint [/beta-v1/users/auth]

### ユーザ認証（サインイン） [POST]

* メールアドレスとパスワードで認証を行い、アクセストークンを取得する。

+ Request (application/json)

    + Attributes
        + email: test@example.com (string, required) - メールアドレス（format: email）
        + password: abc123 (string, required) - パスワード（pattern: ^[0-9A-Za-z]{6,16}$）

+ Response 200 (application/json)

    + Attributes
        + accessToken: f58ba22059f5a8aa8f346e0f40987adab326041faa (string, required) - アクセストークン

+ Response 400 (application/json)

    + Body

            {
                "error": "Invalid arguments",
                "message": "Email or password, or both are wrong.",
            }



# Group Tasks
タスク管理用機能。  
各エンドポイントへのアクセスには、アクセストークンが必須。

## Task List Endpoint [/beta-v1/tasks{?q,sort,limit,offset}]

### タスク一覧取得 [GET]

* タスクを検索して結果一覧を取得する。

+ Parameters

    + q: `arglio` (string) - タスクのTitleまたはBodyに対する部分一致検索
    + sort: `lastModifiedAt` (string, optional) - ソート順の指定。末尾の＋は昇順、ーは降順を意味する。カンマ区切りで複数指定可能。
        + Default: `lastModifiedAt`
        + Members
            + `lastModifiedAt`
            + `-lastModifiedAt`
            + `title`
            + `-title`
    + limit: `25` (integer, optional) - 検索結果の最大返却件数。最大で100
      + Default: `20`
    + offset: 4 (integer, optional) - 結果件数の取得開始位置
      + Default: `0`
     
+ Request

    + Headers

            Authorization: f58ba22059f5a8aa8f346e0f40987adab326041faa

+ Response 200 (application/json)

    + Attributes (TaskList)

+ Response 401 (application/json)

    + Body

            {
                "error": "Unauthorized",
                "message": "Invalid token.",
            }



## Task Collection Endpoint [/beta-v1/tasks]

### タスク新規作成 [POST]

* 新しいタスクを追加する。
* タイトルまたはコンテンツの一方は必須とする。
* 作成日時も指定可能（省略時はサーバ上でのリクエスト時刻が採用される）。

- 日時フォーマット（共通）
  - `YYYY-MM-DDTHH:mm:ss.SSSZ`
    - SSS：miri second (oprional)
    - Z：Offset from UTC as +-HH:mm, +-HHmm, or Z (required)
    - ex:
      - `2019-01-01T00:00:00Z`: UTC
      - `2019-04-01T15:30:15.837+09:00`: JST


+ Request (application/json)

    + Headers

            Authorization: f58ba22059f5a8aa8f346e0f40987adab326041faa

    + Attributes
        + title: `my new task` (string, optional) - タイトル
        + body: `I'll do something` (string, optional) - コンテンツ
        + at: `2019-04-08T11:36:45+0000` (string, optional) - 作成日時。JSTなら'+0900'

+ Response 201 (application/json)

    + Headers

            Location: /beta-v1/tasks/1
            
    + Attributes (TaskData)

+ Response 400 (application/json)

    + Body

            {
                "error": "Invalid arguments",
                "message": "Task body is required.",
            }

+ Response 401 (application/json)

    + Body

            {
                "error": "Unauthorized",
                "message": "Invalid token.",
            }



## Task Detail Endpoint [/beta-v1/tasks/{taskId}]

+ Parameters

    + taskId: `36` (required, string) - タスクID。存在しないIDを指定した場合は404が返る。
    

### タスク編集 [PATCH]

* タスクの内容を更新する。
* タイトルまたはコンテンツの一方は必須とする。空文字を渡した場合は空文字で更新する。
* 更新日時も指定可能（省略時はサーバ上でのリクエスト時刻が採用される）。

+ Request (application/json)

    + Headers

            Authorization: f58ba22059f5a8aa8f346e0f40987adab326041faa

    + Attributes
        + title: `my new title` (string, optional) - タイトル
        + body: `I'll do something` (string, optional) - コンテンツ
        + at: `2019-04-08T11:36:45+0900` (string, optional) - 更新日時。

+ Response 201 (application/json)

    + Headers

            Location: /beta-v1/tasks/1
            
    + Attributes (TaskData)

+ Response 400 (application/json)

    + Body

            {
                "error": "Invalid arguments",
                "message": "task body is required.",
            }

+ Response 401 (application/json)

    + Body

            {
                "error": "Unauthorized",
                "message": "Invalid token.",
            }


### タスク削除 [DELETE]

* タスクを削除する。

+ Request (application/json)

    + Headers

            Authorization: f58ba22059f5a8aa8f346e0f40987adab326041faa

+ Response 200 (application/json)

+ Response 401 (application/json)

    + Body

            {
                "error": "Unauthorized",
                "message": "Invalid token.",
            }




## Task Star Endpoint [/beta-v1/tasks/{taskId}/star]

+ Parameters

    + taskId: `36` (required, string) - タスクID。存在しないIDを指定した場合は404が返る
    

### スターON [PUT]

* タスクにスターを付加する。

+ Request (application/json)

    + Headers

            Authorization: f58ba22059f5a8aa8f346e0f40987adab326041faa

+ Response 200 (application/json)

    + Attributes (TaskData)

+ Response 401 (application/json)

    + Body

            {
                "error": "Unauthorized",
                "message": "Invalid token.",
            }


### スターOFF [DELETE]

* タスクからスターを削除する。

+ Request (application/json)

    + Headers

            Authorization: f58ba22059f5a8aa8f346e0f40987adab326041faa

+ Response 200 (application/json)

    + Attributes (TaskData)

+ Response 401 (application/json)

    + Body

            {
                "error": "Unauthorized",
                "message": "Invalid token.",
            }


