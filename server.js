const express = require('express');
const app = express();

app.use(express.static('static'));

app.listen(5000, function () {
  console.log('listening on port 5000');
});
