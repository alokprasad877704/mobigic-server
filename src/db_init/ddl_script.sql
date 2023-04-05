CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "user_name" varchar(255),
  "password" varchar(255),
  "created_at" timestamp DEFAULT NOW()
);

CREATE TABLE "files" (
  "id" SERIAL PRIMARY KEY,
  "file_url" varchar(255),
  "user_id" integer,
  "file_name" varchar(255),
  "unique_code" varchar(255),
  "uploaded_at" timestamp DEFAULT NOW()
);

ALTER TABLE "files" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
