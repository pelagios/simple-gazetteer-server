const express = require('express');

//Create an app
const app = express();

app.get('/', (req, res) => {
    res.send('Hello world\n');
});

//Listen port
const PORT = 8080;
app.listen(PORT);

console.log(`API running on port ${PORT}`);