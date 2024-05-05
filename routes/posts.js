const express = require('express');
const router = express.Router();
const Post = require('../models/posts')
const mongoose = require('mongoose');
const isValidObjectId = mongoose.Types.ObjectId.isValid; // 驗證是否是 mongoose 的 id
const successHandle = require('../utils/successHandle')
const errorHandle = require('../utils/errorHandle');

/* GET users listing. */
router.get('/', async(req, res, next) => {
  const Posts = await Post.find().exec();
  successHandle(res, Posts)
});

router.post('/', async(req, res, next) => {
  try {
    let {content, image, name} = req.body;
    content = content.trim()
    name = name.trim()
    const newPost = await Post.create({
      content,
      image,
      name,
      likes: 0
    }) 
    successHandle(res, newPost)
    
  } catch (error) {
    const errors = Object.values(error.errors).map(item => item.message)
    if(errors.length) {
      errorHandle(res, errors.join(','))
    } else {
      res.status(500).json({
        status: 'false',
        message: `格式錯誤`
      })
    }
  }
});

router.delete('/', async(req, res, next) => {
  await Post.deleteMany({})
  successHandle(res, [])
});

router.delete('/:id', async(req, res, next) => {
  try {
    const id = req.params.id
    if (!isValidObjectId(id)) { 
      return errorHandle(res, 'ID 格式錯誤')
    }
    const deletedId = await Post.findByIdAndDelete(id);
    if(deletedId) {
      successHandle(res, null, '刪除成功')
    } else {
      errorHandle(res, '找不到此 ID')
    }
   
  } catch (error) {
    errorHandle(req, error)
  }
});

router.patch('/:id', async(req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) { 
      return errorHandle(res, 'ID 格式錯誤')
    }
    let { content } = req.body;
    content = content.trim()
    const updatedPost = await Post.findByIdAndUpdate(id, {
      content
    }, {
      runValidators: true, // 更新資料時也能保有驗證機制
      new: true  // 返回更新後的 updatedPost
    })
    if(updatedPost) {
      successHandle(res, updatedPost)
    } else {
      errorHandle(res, '找不到此 ID')
    }
    
  }catch (error) {
    const errors = Object.values(error.errors).map(item => item.message)
    if(errors.length) {
      errorHandle(res, errors.join(','))
    } else {
      res.status(500).json({
        status: 'false',
        message: `格式錯誤`
      })
    }
  }
});

module.exports = router;
