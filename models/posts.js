const mongoose = require('mongoose');
const postSchema = new mongoose.Schema( {
  content: {
    type: String,
    required: [true, 'Content 未填寫']
  },
  image: {
    type:String,
    default:""
  },
  name: {
      type: String,
      required: [true, '貼文姓名未填寫']
  },
  likes: {
      type:Number,
      default:0
    }
}, {
  timestamps: true,
  versionKey: false,
})

const Post = new mongoose.model('Post', postSchema);

module.exports = Post