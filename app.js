const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors"); // 引入允許跨網域套件 cors
const postsRouter = require('./routes/posts');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())
app.use('/posts', postsRouter);
dotenv.config({path: "./.env"});
const DB =  process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)
mongoose
  .connect(DB)
  .then(() => console.log("資料庫連接成功"))
  .catch((err) => {
    console.log("MongoDB 連接失敗:", err);
  });
module.exports = app;
