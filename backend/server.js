// SwiftSocket WebSocket Server
// Uses ws library for real-time chat
// Run: npm install ws

const WebSocket = require('ws');
const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

let clients = [];

wss.on('connection', (ws) => {
    clients.push(ws);
    console.log('New client connected');
    broadcast({ type: 'status', message: 'A user connected.' });

    ws.on('message', (data) => {
        try {
            // Ensure proper UTF-8 handling for emojis
            const msg = JSON.parse(data.toString('utf8'));
            console.log('Received:', msg);
            
            // Basic validation
            if (msg.message && msg.message.trim()) {
                broadcast({ type: 'chat', ...msg });
            }
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log('Client disconnected');
        broadcast({ type: 'status', message: 'A user disconnected.' });
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

function broadcast(msg) {
    const data = JSON.stringify(msg);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

console.log(`WebSocket server running on ws://localhost:${PORT}`);
