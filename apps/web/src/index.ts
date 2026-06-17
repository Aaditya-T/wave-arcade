import { createServer } from 'node:http';

const PORT = 3000;

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Wave Arcade web stub');
});

server.listen(PORT, () => {
  console.log(`[web] stub running at http://localhost:${PORT}`);
});
