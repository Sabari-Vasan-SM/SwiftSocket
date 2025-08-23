# SwiftSocket

A real-time chat application using WebSockets.

## Project Structure
- `backend/` — Node.js WebSocket server
- `frontend/` — React client

## Backend Setup
1. Open a terminal in `backend` folder.
2. Run `npm install` to install dependencies.
3. Start the server: `npm start`
   - The server runs on ws://localhost:8080

## Frontend Setup
1. Open a terminal in `frontend` folder.
2. If not already done, run `npx create-react-app .` to scaffold the React app.
3. Replace `src/App.js` with the provided code.
4. Run `npm start` to launch the frontend.
   - The app connects to ws://localhost:8080

## Features
- Real-time messaging
- Username support
- Message history
- Connection status
- Auto-reconnect

## Notes
- Ensure both backend and frontend are running for full functionality.
- For production, consider deploying backend and frontend separately and updating WebSocket URL accordingly.
