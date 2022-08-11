const fs = require('fs');
const http = require('http');
const port = 3004;

console.log(`📖 [docs]: Running at https://localhost:${port}`);
http.createServer(function (req, res) {
    fs.readFile(__dirname + req.url, function (err,data) {
        if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
        }
        res.writeHead(200);
        res.end(data);
    });
}).listen(port);