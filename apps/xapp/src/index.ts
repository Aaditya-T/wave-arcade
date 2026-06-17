import { createServer } from 'node:http';

const PORT = 3001;

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Wave Arcade xapp stub');
});

server.listen(PORT, () => {
  console.log(`[xapp] stub running at http://localhost:${PORT}`);
});
