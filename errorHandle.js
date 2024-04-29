const headers = require('./headers')
function errorHandle (res, error) {
  res.writeHead(400, headers)
  console.error(res)
  res.write(JSON.stringify({
    "status": "false",
    "message": error || "欄位錯誤或者查無此id"
  }))
  res.end()
}

module.exports = errorHandle