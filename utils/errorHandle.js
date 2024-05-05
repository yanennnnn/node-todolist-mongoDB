function errorHandle (res, error) {
  res.status(400).json({
    status: 'false',
    message: error
  })
}

module.exports = errorHandle