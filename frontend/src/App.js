import React, { useState, useEffect, useRef } from 'react';

const WS_URL = 'ws://localhost:8080';

function App() {
	const [ws, setWs] = useState(null);
	const [connected, setConnected] = useState(false);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [username, setUsername] = useState('');
	const [nameSet, setNameSet] = useState(false);
	const [reconnectAttempts, setReconnectAttempts] = useState(0);
	const reconnectTimeout = useRef(null);

	useEffect(() => {
		connectWS();
		return () => {
			if (ws) ws.close();
			if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
		};
		// eslint-disable-next-line
	}, []);

	const connectWS = () => {
		const socket = new window.WebSocket(WS_URL);
		setWs(socket);

		socket.onopen = () => {
			setConnected(true);
			setReconnectAttempts(0);
		};
		socket.onmessage = (event) => {
			const msg = JSON.parse(event.data);
			setMessages((prev) => [...prev, msg]);
		};
		socket.onclose = () => {
			setConnected(false);
			autoReconnect();
		};
		socket.onerror = (err) => {
			setConnected(false);
			autoReconnect();
		};
	};

	const autoReconnect = () => {
		if (reconnectAttempts < 5) {
			reconnectTimeout.current = setTimeout(() => {
				setReconnectAttempts((a) => a + 1);
				connectWS();
			}, 2000 * (reconnectAttempts + 1));
		}
	};

	const sendMessage = () => {
		if (ws && connected && input.trim()) {
			ws.send(JSON.stringify({ username, message: input }));
			setInput('');
		}
	};

	const handleInput = (e) => setInput(e.target.value);
	const handleName = (e) => setUsername(e.target.value);

	const handleSetName = () => {
		if (username.trim()) setNameSet(true);
	};

	return (
		<div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
			<h2>SwiftSocket Chat</h2>
			<div style={{ marginBottom: 10 }}>
				Status: <span style={{ color: connected ? 'green' : 'red' }}>{connected ? 'Connected' : 'Disconnected'}</span>
				{reconnectAttempts > 0 && !connected && (
					<span> (Reconnecting... attempt {reconnectAttempts})</span>
				)}
			</div>
			{!nameSet ? (
				<div style={{ marginBottom: 20 }}>
					<input
						type="text"
						placeholder="Enter your username"
						value={username}
						onChange={handleName}
						style={{ marginRight: 10 }}
					/>
					<button onClick={handleSetName}>Set Username</button>
				</div>
			) : (
				<>
					<div style={{ border: '1px solid #ccc', height: 250, overflowY: 'auto', padding: 10, marginBottom: 10, background: '#fafafa' }}>
						{messages.map((msg, i) => (
							<div key={i} style={{ marginBottom: 6 }}>
								{msg.type === 'chat' ? (
									<b>{msg.username || 'Anonymous'}:</b>
								) : (
									<span style={{ color: '#888' }}>[Server]</span>
								)}
								<span style={{ marginLeft: 6 }}>{msg.message}</span>
							</div>
						))}
					</div>
					<div>
						<input
							type="text"
							value={input}
							onChange={handleInput}
							placeholder="Type a message..."
							style={{ width: '70%', marginRight: 10 }}
							onKeyDown={e => e.key === 'Enter' && sendMessage()}
							disabled={!connected}
						/>
						<button onClick={sendMessage} disabled={!connected}>Send</button>
					</div>
				</>
			)}
		</div>
	);
}

export default App;
