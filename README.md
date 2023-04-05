# Mobigic File handling application server

clone the repo and checkout to main branch
## Run Script to install dependencies
```bash
yarn install
```

## make sure you have postgres setup

## create a database called "mobigic_file_handling" on postgres

## run the ddl_script written in the file src/db_init/ddl_script.sql 

## create .env at the root directory

## add the following content into .env file
```bash 
MOBIGIC_SERVER_POSTGRES_URL= "postgres://<user_name>:<password>@localhost:5432/mobigic_file_handling"
PORT = 5000
JWT_PRIVATE_KEY = "123456"
MOBIGIC_S3_BUCKET_NAME = "your_bucket_name"
AWS_S3_ACCESS_KEY_ID = "your_access_key_id"
AWS_S3_SECRET_ACCESS_KEY = "your_secret_access_key"
```
## Run Script to start the application
```bash
yarn start
```