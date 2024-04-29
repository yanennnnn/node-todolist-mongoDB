const http = require('http');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config({path: "./.env"});
const Post = require('./models/posts')
const successHandle = require('./successHandle');
const errorHandle = require('./errorHandle');
const headers = require('./headers');
const isValidObjectId = mongoose.Types.ObjectId.isValid; // 驗證是否是 mongoose 的 id
const DB =  process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB)
.then(()=> {
  console.log('資料庫連線成功')
}).catch((error)=> {
  console.log(error);
})


const requestListener = async(req, res) => {
  let body = '';
  req.on('data', chunk => 
    body += chunk
  )

  if(req.url == '/posts' && req.method == 'GET') {
    const posts = await Post.find().exec();
    successHandle(res, posts)
  } else if(req.url == '/posts' && req.method == 'POST') {
    req.on('end', async ()=> {
      try {
        const data = JSON.parse(body);
        if(data.content !== undefined){ 
          const newPost = await Post.create({
            ...data
          });
          successHandle(res, newPost);
        } else {
          res.writeHead(400,headers);
          res.write(JSON.stringify({
              "status": "false",
              "message": "欄位未填寫正確，或無此 todo ID",
          }));
          res.end();
        }
      } catch(error) {
        const errors = Object.values(error.errors).map(item => item.message).join(',')
        errorHandle(res, errors);
      }
    })
  } else if (req.url == '/posts' && req.method == 'DELETE') {
    await Post.deleteMany({})
    successHandle(res, [])
  } else if (req.url.startsWith('/posts/') && req.method == 'DELETE') {
    try {
      const id = req.url.split('/').pop();
      if (isValidObjectId(id)) {
        const deletedID = await Post.findByIdAndDelete(id)
        if(!deletedID) {
          errorHandle(res, '查無此 ID');
        } else {
          successHandle(res, {})
        }
      } else {
        errorHandle(res, 'ID 格式錯誤');
      }
    
    } catch (error) {
      errorHandle(res, '查無此 ID');
    }
  
  } else if (req.url.startsWith('/posts/') && req.method == 'PATCH') {
    req.on('end', async ()=> {
      try {
        const data = JSON.parse(body)
        const id = req.url.split('/').pop()
        if (!isValidObjectId(id)) {
          errorHandle(res, 'ID 格式錯誤');
        } else {
          const updateId = await Post.findByIdAndUpdate(id, data, {
            runValidators: true,
            new: true
          });
          if(!updateId) {
            errorHandle(res, '查無此 ID');
          } else {
            successHandle(res, updateId)
          }
        }
      } catch (error) {
        const errors = Object.values(error.errors).map(item => item.message).join(',')
        errorHandle(res, errors);
      }
    })
  } else {
    res.writeHead(404, headers)
    res.write(JSON.stringify({
      "status": false,
      "meaasge": '無此路由'
    }))
    res.end() 
  }
}

const server = http.createServer(requestListener)
server.listen(process.env.PORT || 3005)