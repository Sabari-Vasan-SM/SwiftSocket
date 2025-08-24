import React, { useState, useEffect, useRef } from 'react';

const WS_URL = 'ws://localhost:8080';

function App() {
	const wsRef = useRef(null);
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
			if (wsRef.current) {
				wsRef.current.onopen = null;
				wsRef.current.onmessage = null;
				wsRef.current.onclose = null;
				wsRef.current.onerror = null;
				wsRef.current.close();
			}
			if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
		};
		// eslint-disable-next-line
	}, []);

	const connectWS = () => {
		// Close previous socket if exists
		if (wsRef.current) {
			wsRef.current.onopen = null;
			wsRef.current.onmessage = null;
			wsRef.current.onclose = null;
			wsRef.current.onerror = null;
			wsRef.current.close();
		}
		const socket = new window.WebSocket(WS_URL);
		wsRef.current = socket;

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
		if (wsRef.current && connected && input.trim()) {
			wsRef.current.send(JSON.stringify({ username, message: input }));
			setInput('');
		}
	};

	const handleInput = (e) => setInput(e.target.value);
	const handleName = (e) => setUsername(e.target.value);

	const handleSetName = () => {
		if (username.trim()) setNameSet(true);
	};

	return (
		<div style={{
			maxWidth: 500,
			margin: '40px auto',
			fontFamily: 'Inter, Arial, sans-serif',
			background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
			borderRadius: 20,
			boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
			padding: 32,
			position: 'relative',
			overflow: 'hidden',
			border: '1px solid #e3e3e3'
		}}>
			<h2 style={{
				textAlign: 'center',
				fontWeight: 700,
				fontSize: 28,
				letterSpacing: 1,
				marginBottom: 18,
				color: '#2d3748',
				textShadow: '0 2px 8px #e0eafc'
			}}>SwiftSocket Chat</h2>
			<div style={{
				marginBottom: 18,
				textAlign: 'center',
				fontSize: 16,
				fontWeight: 500
			}}>
				Status: <span style={{
					color: connected ? '#38b2ac' : '#e53e3e',
					fontWeight: 700,
					transition: 'color 0.3s'
				}}>{connected ? 'Connected' : 'Disconnected'}</span>
				{reconnectAttempts > 0 && !connected && (
					<span style={{ color: '#718096', marginLeft: 8, fontSize: 14, animation: 'fadeIn 1s' }}>
						(Reconnecting... attempt {reconnectAttempts})
					</span>
				)}
			</div>
			{!nameSet ? (
				<div style={{
					marginBottom: 28,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 12
				}}>
					<input
						type="text"
						placeholder="Enter your username"
						value={username}
						onChange={handleName}
						style={{
							padding: '10px 16px',
							borderRadius: 12,
							border: '1px solid #cbd5e0',
							fontSize: 16,
							outline: 'none',
							boxShadow: '0 2px 8px #e0eafc',
							transition: 'border 0.2s',
							width: 180
						}}
					/>
					<button
						onClick={handleSetName}
						style={{
							padding: '10px 20px',
							borderRadius: 12,
							background: 'linear-gradient(90deg, #38b2ac 0%, #4299e1 100%)',
							color: '#fff',
							fontWeight: 600,
							fontSize: 16,
							border: 'none',
							boxShadow: '0 2px 8px #e0eafc',
							cursor: 'pointer',
							transition: 'background 0.3s, transform 0.2s',
							outline: 'none'
						}}
						onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
						onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
					>Set Username</button>
				</div>
			) : (
				<>
					<div style={{
						borderRadius: 16,
						height: 260,
						overflowY: 'auto',
						padding: 16,
						marginBottom: 18,
						background: 'rgba(255,255,255,0.85)',
						boxShadow: '0 2px 8px #e0eafc',
						border: '1px solid #e3e3e3',
						animation: 'fadeIn 0.7s'
					}}>
						{messages.map((msg, i) => (
							<div key={i} style={{
								marginBottom: 10,
								display: 'flex',
								alignItems: 'center',
								animation: 'slideIn 0.4s',
								background: msg.type === 'chat' ? 'linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%)' : 'none',
								borderRadius: 8,
								padding: msg.type === 'chat' ? '6px 12px' : '0',
								boxShadow: msg.type === 'chat' ? '0 1px 4px #e0eafc' : 'none'
							}}>
								{msg.type === 'chat' ? (
									<span style={{
										fontWeight: 600,
										color: '#4299e1',
										marginRight: 8,
										fontSize: 15,
										letterSpacing: 0.5
									}}>{msg.username || 'Anonymous'}:</span>
								) : (
									<span style={{ color: '#718096', fontWeight: 500, fontSize: 14 }}>[Server]</span>
								)}
								<span style={{ marginLeft: 2, fontSize: 15, color: '#2d3748' }}>{msg.message}</span>
							</div>
						))}
					</div>
					<div style={{ display: 'flex', gap: 12 }}>
						<input
							type="text"
							value={input}
							onChange={handleInput}
							placeholder="Type a message..."
							style={{
								flex: 1,
								padding: '10px 16px',
								borderRadius: 12,
								border: '1px solid #cbd5e0',
								fontSize: 16,
								outline: 'none',
								boxShadow: '0 2px 8px #e0eafc',
								transition: 'border 0.2s',
								marginRight: 0
							}}
							onKeyDown={e => e.key === 'Enter' && sendMessage()}
							disabled={!connected}
						/>
						<button
							onClick={sendMessage}
							disabled={!connected}
							style={{
								padding: '10px 20px',
								borderRadius: 12,
								background: connected ? 'linear-gradient(90deg, #38b2ac 0%, #4299e1 100%)' : '#cbd5e0',
								color: '#fff',
								fontWeight: 600,
								fontSize: 16,
								border: 'none',
								boxShadow: '0 2px 8px #e0eafc',
								cursor: connected ? 'pointer' : 'not-allowed',
								transition: 'background 0.3s, transform 0.2s',
								outline: 'none'
							}}
							onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
							onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
						>Send</button>
					</div>
				</>
			)}
			{/* Animations */}
			<style>{`
				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}
				@keyframes slideIn {
					from { transform: translateY(20px); opacity: 0; }
					to { transform: translateY(0); opacity: 1; }
				}
			`}</style>
		</div>
	);
}

export default App;
