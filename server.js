const http = require('http');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config({path: "./.env"});

const Post = require('./models/posts')
const successHandle = require('./successHandle');
const errorHandle = require('./errorHandle');
const headers = require('./headers');
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
        const newPost = await Post.create({
          ...data
        });
        successHandle(res, newPost);
      } catch(error) {
        errorHandle(res);
      }
    })
  } else if (req.url == '/posts' && req.method == 'DELETE') {
    await Post.deleteMany({})
    successHandle(res, [])
  } else if (req.url.startsWith('/posts/') && req.method == 'DELETE') {
    const id = req.url.split('/').pop();
    await Post.findByIdAndDelete(id);
    successHandle(res, null)
  } else if (req.url.startsWith('/posts/') && req.method == 'PATCH') {
    req.on('end', async ()=> {
      try {
        const data = JSON.parse(body)
        const id = req.url.split('/').pop()
        await Post.findByIdAndUpdate(id, data);
        const newPost = await Post.findById(id).exec();
        successHandle(res, newPost)
      } catch (error) {
        errorHandle(res);
      }
    })
  } else {
    res.writeHead(404, headers)
    res.write(JSON.stringify({
      "status": false,
      "meaasge": '無此路由'
    }))
  }
}

const server = http.createServer(requestListener)
server.listen(3005)