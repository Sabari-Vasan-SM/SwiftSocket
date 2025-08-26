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
	const [darkMode, setDarkMode] = useState(false);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

	// Close emoji picker when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (showEmojiPicker && !event.target.closest('.emoji-container')) {
				setShowEmojiPicker(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showEmojiPicker]);

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

	const toggleDarkMode = () => {
		setDarkMode(!darkMode);
	};

	const toggleEmojiPicker = () => {
		setShowEmojiPicker(!showEmojiPicker);
	};

	const addEmoji = (emoji) => {
		setInput(prev => prev + emoji);
		setShowEmojiPicker(false);
	};

	// Common emojis for the picker
	const emojis = [
		'😀', '😂', '😊', '😍', '🤔', '😎', '😭', '😡', '👍', '👎',
		'❤️', '💔', '😘', '😜', '🤗', '😴', '🤯', '😇', '😈', '🤪',
		'🔥', '💯', '✨', '⭐', '🎉', '🎊', '🙌', '👏', '💪', '🤝',
		'🌟', '⚡', '💎', '🏆', '🎯', '🚀', '💡', '🎵', '🎈', '🎁'
	];

	const theme = {
		light: {
			primary: '#6750A4',
			onPrimary: '#FFFFFF',
			primaryContainer: '#EADDFF',
			onPrimaryContainer: '#21005D',
			secondary: '#625B71',
			onSecondary: '#FFFFFF',
			secondaryContainer: '#E8DEF8',
			onSecondaryContainer: '#1D192B',
			tertiary: '#7D5260',
			onTertiary: '#FFFFFF',
			tertiaryContainer: '#FFD8E4',
			onTertiaryContainer: '#31111D',
			error: '#BA1A1A',
			onError: '#FFFFFF',
			errorContainer: '#FFDAD6',
			onErrorContainer: '#410002',
			background: '#FFFBFE',
			onBackground: '#1C1B1F',
			surface: '#FFFBFE',
			onSurface: '#1C1B1F',
			surfaceVariant: '#E7E0EC',
			onSurfaceVariant: '#49454F',
			outline: '#79747E',
			outlineVariant: '#CAC4D0',
			shadow: '#000000',
			scrim: '#000000',
			inverseSurface: '#313033',
			inverseOnSurface: '#F4EFF4',
			inversePrimary: '#D0BCFF'
		},
		dark: {
			primary: '#D0BCFF',
			onPrimary: '#381E72',
			primaryContainer: '#4F378B',
			onPrimaryContainer: '#EADDFF',
			secondary: '#CCC2DC',
			onSecondary: '#332D41',
			secondaryContainer: '#4A4458',
			onSecondaryContainer: '#E8DEF8',
			tertiary: '#EFB8C8',
			onTertiary: '#492532',
			tertiaryContainer: '#633B48',
			onTertiaryContainer: '#FFD8E4',
			error: '#FFB4AB',
			onError: '#690005',
			errorContainer: '#93000A',
			onErrorContainer: '#FFDAD6',
			background: '#1C1B1F',
			onBackground: '#E6E1E5',
			surface: '#1C1B1F',
			onSurface: '#E6E1E5',
			surfaceVariant: '#49454F',
			onSurfaceVariant: '#CAC4D0',
			outline: '#938F99',
			outlineVariant: '#49454F',
			shadow: '#000000',
			scrim: '#000000',
			inverseSurface: '#E6E1E5',
			inverseOnSurface: '#313033',
			inversePrimary: '#6750A4'
		}
	};

	const currentTheme = darkMode ? theme.dark : theme.light;

	return (
		<div style={{
			minHeight: '100vh',
			backgroundColor: currentTheme.background,
			color: currentTheme.onBackground,
			fontFamily: "'Roboto', 'Inter', system-ui, -apple-system, sans-serif",
			transition: 'background-color 0.3s ease, color 0.3s ease',
			padding: '16px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center'
		}}>
			<div style={{
				width: '100%',
				maxWidth: '600px',
				backgroundColor: currentTheme.surface,
				borderRadius: '28px',
				boxShadow: darkMode 
					? '0 8px 32px rgba(0, 0, 0, 0.4)' 
					: '0 8px 32px rgba(0, 0, 0, 0.08)',
				padding: '24px',
				position: 'relative',
				overflow: 'hidden',
				border: `1px solid ${currentTheme.outlineVariant}`,
				transition: 'background-color 0.3s ease, border-color 0.3s ease'
			}}>
				{/* Header with dark mode toggle */}
				<div style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '24px'
				}}>
					<h1 style={{
						fontSize: 'clamp(24px, 5vw, 32px)',
						fontWeight: '400',
						margin: '0',
						color: currentTheme.onSurface,
						letterSpacing: '0.25px'
					}}>SwiftSocket</h1>
					
					{/* Material Design Toggle Switch */}
					<div style={{
						display: 'flex',
						alignItems: 'center',
						gap: '12px'
					}}>
						<span style={{
							fontSize: '14px',
							color: currentTheme.onSurfaceVariant,
							fontWeight: '500'
						}}>
							{darkMode ? 'Dark' : 'Light'}
						</span>
						<div
							onClick={toggleDarkMode}
							style={{
								width: '52px',
								height: '32px',
								borderRadius: '16px',
								backgroundColor: darkMode ? currentTheme.primary : currentTheme.outline,
								cursor: 'pointer',
								position: 'relative',
								transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
								border: 'none',
								outline: 'none',
								boxShadow: darkMode 
									? '0 2px 8px rgba(103, 80, 164, 0.3)' 
									: '0 2px 8px rgba(0, 0, 0, 0.1)'
							}}
							onMouseEnter={e => {
								e.target.style.transform = 'scale(1.05)';
							}}
							onMouseLeave={e => {
								e.target.style.transform = 'scale(1)';
							}}
						>
							{/* Toggle thumb */}
							<div style={{
								width: '24px',
								height: '24px',
								borderRadius: '50%',
								backgroundColor: darkMode ? currentTheme.onPrimary : currentTheme.surface,
								position: 'absolute',
								top: '4px',
								left: darkMode ? '24px' : '4px',
								transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
								boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: '12px'
							}}>
								{darkMode ? '🌙' : '☀️'}
							</div>
						</div>
					</div>
				</div>

				{/* Status indicator */}
				<div style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginBottom: '24px',
					padding: '12px 20px',
					backgroundColor: connected ? currentTheme.primaryContainer : currentTheme.errorContainer,
					color: connected ? currentTheme.onPrimaryContainer : currentTheme.onErrorContainer,
					borderRadius: '16px',
					fontSize: '14px',
					fontWeight: '500',
					transition: 'all 0.3s ease'
				}}>
					<div style={{
						width: '8px',
						height: '8px',
						borderRadius: '50%',
						backgroundColor: connected ? currentTheme.primary : currentTheme.error,
						marginRight: '8px',
						animation: connected ? 'pulse 2s infinite' : 'none'
					}}></div>
					{connected ? 'Connected' : 'Disconnected'}
					{reconnectAttempts > 0 && !connected && (
						<span style={{ 
							marginLeft: '8px',
							fontSize: '12px',
							opacity: '0.7'
						}}>
							(Reconnecting... {reconnectAttempts}/5)
						</span>
					)}
				</div>
				{/* Username input */}
				{!nameSet ? (
					<div style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '16px',
						alignItems: 'center'
					}}>
						<div style={{
							position: 'relative',
							width: '100%',
							maxWidth: '300px'
						}}>
							<input
								type="text"
								placeholder="Enter your username"
								value={username}
								onChange={handleName}
								style={{
									width: '100%',
									padding: '16px 20px',
									borderRadius: '16px',
									border: `2px solid ${currentTheme.outline}`,
									backgroundColor: currentTheme.surface,
									color: currentTheme.onSurface,
									fontSize: '16px',
									outline: 'none',
									transition: 'all 0.2s ease',
									fontFamily: 'inherit',
									boxSizing: 'border-box'
								}}
								onFocus={e => {
									e.target.style.borderColor = currentTheme.primary;
									e.target.style.backgroundColor = currentTheme.surfaceVariant;
								}}
								onBlur={e => {
									e.target.style.borderColor = currentTheme.outline;
									e.target.style.backgroundColor = currentTheme.surface;
								}}
							/>
						</div>
						<button
							onClick={handleSetName}
							disabled={!username.trim()}
							style={{
								padding: '16px 32px',
								borderRadius: '20px',
								background: username.trim() ? currentTheme.primary : currentTheme.surfaceVariant,
								color: username.trim() ? currentTheme.onPrimary : currentTheme.onSurfaceVariant,
								fontWeight: '600',
								fontSize: '16px',
								border: 'none',
								cursor: username.trim() ? 'pointer' : 'not-allowed',
								transition: 'all 0.3s ease',
								outline: 'none',
								fontFamily: 'inherit',
								minWidth: '140px',
								boxShadow: username.trim() ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
							}}
							onMouseDown={e => username.trim() && (e.currentTarget.style.transform = 'scale(0.95)')}
							onMouseUp={e => username.trim() && (e.currentTarget.style.transform = 'scale(1)')}
						>
							Start Chat
						</button>
					</div>
				) : (
					<>
						{/* Messages container */}
						<div style={{
							borderRadius: '20px',
							height: 'clamp(300px, 50vh, 400px)',
							overflowY: 'auto',
							padding: '16px',
							marginBottom: '20px',
							backgroundColor: currentTheme.surfaceVariant,
							border: `1px solid ${currentTheme.outlineVariant}`,
							transition: 'all 0.3s ease',
							scrollbarWidth: 'thin',
							scrollbarColor: `${currentTheme.outline} transparent`
						}}>
							{messages.length === 0 ? (
								<div style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									height: '100%',
									color: currentTheme.onSurfaceVariant,
									fontSize: '14px',
									fontStyle: 'italic'
								}}>
									No messages yet. Start the conversation!
								</div>
							) : (
								messages.map((msg, i) => (
									<div key={i} style={{
										marginBottom: '12px',
										animation: 'slideIn 0.4s ease-out',
										display: 'flex',
										flexDirection: 'column',
										gap: '4px'
									}}>
										{msg.type === 'chat' ? (
											<div style={{
												backgroundColor: msg.username === username ? currentTheme.primaryContainer : currentTheme.secondaryContainer,
												color: msg.username === username ? currentTheme.onPrimaryContainer : currentTheme.onSecondaryContainer,
												borderRadius: '16px',
												padding: '12px 16px',
												maxWidth: '85%',
												alignSelf: msg.username === username ? 'flex-end' : 'flex-start',
												wordWrap: 'break-word',
												position: 'relative',
												boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
												transition: 'all 0.2s ease'
											}}>
												<div style={{
													fontSize: '12px',
													fontWeight: '600',
													marginBottom: '4px',
													opacity: '0.8'
												}}>
													{msg.username || 'Anonymous'}
												</div>
												<div style={{
													fontSize: '15px',
													lineHeight: '1.4'
												}}>
													{msg.message}
												</div>
											</div>
										) : (
											<div style={{
												textAlign: 'center',
												color: currentTheme.onSurfaceVariant,
												fontSize: '13px',
												fontStyle: 'italic',
												padding: '8px',
												backgroundColor: currentTheme.surface,
												borderRadius: '12px',
												margin: '0 auto',
												maxWidth: '200px'
											}}>
												{msg.message}
											</div>
										)}
									</div>
								))
							)}
						</div>

						{/* Input area */}
						<div style={{ 
							display: 'flex', 
							gap: '8px',
							flexDirection: window.innerWidth < 480 ? 'column' : 'row',
							position: 'relative'
						}}>
							<div style={{
								flex: 1,
								position: 'relative',
								display: 'flex',
								alignItems: 'center'
							}} className="emoji-container">
								<input
									type="text"
									value={input}
									onChange={handleInput}
									placeholder="Type a message..."
									style={{
										width: '100%',
										padding: '16px 52px 16px 20px',
										borderRadius: '20px',
										border: `2px solid ${currentTheme.outline}`,
										backgroundColor: currentTheme.surface,
										color: currentTheme.onSurface,
										fontSize: '16px',
										outline: 'none',
										transition: 'all 0.2s ease',
										fontFamily: 'inherit',
										minHeight: '24px'
									}}
									onKeyDown={e => e.key === 'Enter' && sendMessage()}
									disabled={!connected}
									onFocus={e => {
										e.target.style.borderColor = currentTheme.primary;
										e.target.style.backgroundColor = currentTheme.surfaceVariant;
									}}
									onBlur={e => {
										e.target.style.borderColor = currentTheme.outline;
										e.target.style.backgroundColor = currentTheme.surface;
									}}
								/>
								{/* Emoji button */}
								<button
									onClick={toggleEmojiPicker}
									style={{
										position: 'absolute',
										right: '8px',
										width: '36px',
										height: '36px',
										borderRadius: '18px',
										border: 'none',
										backgroundColor: showEmojiPicker ? currentTheme.primaryContainer : 'transparent',
										color: showEmojiPicker ? currentTheme.onPrimaryContainer : currentTheme.onSurfaceVariant,
										cursor: 'pointer',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: '18px',
										transition: 'all 0.2s ease',
										outline: 'none'
									}}
									onMouseEnter={e => {
										if (!showEmojiPicker) {
											e.target.style.backgroundColor = currentTheme.surfaceVariant;
										}
									}}
									onMouseLeave={e => {
										if (!showEmojiPicker) {
											e.target.style.backgroundColor = 'transparent';
										}
									}}
								>
									😊
								</button>
								
								{/* Emoji Picker */}
								{showEmojiPicker && (
									<div style={{
										position: 'absolute',
										bottom: '100%',
										right: '0',
										marginBottom: '8px',
										backgroundColor: currentTheme.surface,
										border: `1px solid ${currentTheme.outlineVariant}`,
										borderRadius: '16px',
										padding: '16px',
										boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
										zIndex: 1000,
										display: 'grid',
										gridTemplateColumns: 'repeat(8, 1fr)',
										gap: '8px',
										maxWidth: '320px',
										animation: 'fadeIn 0.2s ease-out'
									}}>
										{emojis.map((emoji, index) => (
											<button
												key={index}
												onClick={() => addEmoji(emoji)}
												style={{
													width: '32px',
													height: '32px',
													border: 'none',
													backgroundColor: 'transparent',
													borderRadius: '8px',
													cursor: 'pointer',
													fontSize: '18px',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													transition: 'all 0.2s ease',
													outline: 'none'
												}}
												onMouseEnter={e => {
													e.target.style.backgroundColor = currentTheme.surfaceVariant;
													e.target.style.transform = 'scale(1.2)';
												}}
												onMouseLeave={e => {
													e.target.style.backgroundColor = 'transparent';
													e.target.style.transform = 'scale(1)';
												}}
											>
												{emoji}
											</button>
										))}
									</div>
								)}
							</div>
							<button
								onClick={sendMessage}
								disabled={!connected || !input.trim()}
								style={{
									padding: '16px 24px',
									borderRadius: '20px',
									background: (connected && input.trim()) ? currentTheme.primary : currentTheme.surfaceVariant,
									color: (connected && input.trim()) ? currentTheme.onPrimary : currentTheme.onSurfaceVariant,
									fontWeight: '600',
									fontSize: '16px',
									border: 'none',
									cursor: (connected && input.trim()) ? 'pointer' : 'not-allowed',
									transition: 'all 0.3s ease',
									outline: 'none',
									fontFamily: 'inherit',
									minWidth: '80px',
									boxShadow: (connected && input.trim()) ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
								}}
								onMouseDown={e => (connected && input.trim()) && (e.currentTarget.style.transform = 'scale(0.95)')}
								onMouseUp={e => (connected && input.trim()) && (e.currentTarget.style.transform = 'scale(1)')}
							>
								Send
							</button>
						</div>
					</>
				)}

				{/* Styles */}
				<style>{`
					@keyframes fadeIn {
						from { opacity: 0; }
						to { opacity: 1; }
					}
					@keyframes slideIn {
						from { 
							transform: translateY(20px); 
							opacity: 0; 
						}
						to { 
							transform: translateY(0); 
							opacity: 1; 
						}
					}
					@keyframes pulse {
						0%, 100% { opacity: 1; }
						50% { opacity: 0.5; }
					}
					
					/* Custom scrollbar for webkit browsers */
					div::-webkit-scrollbar {
						width: 6px;
					}
					div::-webkit-scrollbar-track {
						background: transparent;
					}
					div::-webkit-scrollbar-thumb {
						background: ${currentTheme.outline};
						border-radius: 3px;
					}
					div::-webkit-scrollbar-thumb:hover {
						background: ${currentTheme.onSurfaceVariant};
					}

					/* Mobile responsiveness */
					@media (max-width: 480px) {
						body {
							margin: 0;
							padding: 8px;
						}
					}
				`}</style>
			</div>
		</div>
	);
}

export default App;
