# SecureBlog

Welcome to our secure web based blog system.

# Project Initialization

- Pull git repository
- Run "npm install" to install necessary npm modules.
- Create a file in the root of the "Source" folder called "Authentication.js"

Insert the code:

```js
const postgreInformation = {
  host      : "<hostname>",
  port      : 5432,
  database  : "<databasename>",
  username  : "<yourusername>",
  password  : "<yourpassword>",
  ssl       : require
}

module.exports = postgreInformation;
```

Replace with your information as necessary.

Then save this file.

For the database schema, follow these constraints:

Table name: "posts"

```sql
-- Table: public.posts

-- DROP TABLE IF EXISTS public.posts;

CREATE TABLE IF NOT EXISTS public.posts
(
    id integer NOT NULL DEFAULT nextval('"posts_ID_seq"'::regclass),
    title text COLLATE pg_catalog."default",
    content text COLLATE pg_catalog."default",
    subtitle text COLLATE pg_catalog."default",
    image text COLLATE pg_catalog."default",
    postername text COLLATE pg_catalog."default",
    flagged boolean,
    posterid integer,
    CONSTRAINT posts_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.posts
    OWNER to azure_pg_admin;
```

Table name: "users"

```sql

-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    "ID" integer NOT NULL DEFAULT nextval('"users_ID_seq"'::regclass),
    username text COLLATE pg_catalog."default",
    password text COLLATE pg_catalog."default",
    firstname text COLLATE pg_catalog."default",
    "MFA" text COLLATE pg_catalog."default",
    secret text COLLATE pg_catalog."default",
    isadmin boolean,
    CONSTRAINT users_pkey PRIMARY KEY ("ID")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to azure_pg_admin;

```

- To start the server, run "npm start"
- To run unit tests, run "npm test"
