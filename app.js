const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new Server(8000);

module.exports = { server };

/**
 * A server constructor to host the static files.
 * @param {number} port Port to host the server on.
 */
function Server(port) {
  const publicMap = {
    '/': 'src/index.html',
    '/script.js': 'src/script.js',
    '/style.css': 'src/style.css'
  };
  
  const contentTypeMap = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
  };
  
  const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, publicMap[req.url]);
    const contentType = contentTypeMap[path.extname(filePath)];
    res.setHeader('Content-Type', contentType);
    res.end(fs.readFileSync(filePath, 'utf8'));
  });
  
  server.listen(port, () => console.log(`Server running on port ${port}`));
  this.close = server.close.bind(server);
}