
# WebSocket Component

This directory contains the WebSocket implementation for your project. It includes the logic for handling WebSocket connections, messaging, and business logic related to WebSocket communication.

## Folder Structure

```
websocket/
├── constants/
│   └── messageTypes.js
├── controllers/
│   └── websocketMessageController.js
├── handlers/
│   └── websocketMessageHandler.js
├── services/
│   ├── websocketClient.js
│   └── websocketService.js
├── utils/
│   └── websocketUtils.js
└── websocketServer.js
```

## Description of Files

### Constants

- `messageTypes.js`: Contains the constants for different WebSocket message types used throughout the application.

### Controllers

- `websocketMessageController.js`: Contains the higher-level business logic for handling different WebSocket messages. This module handles tasks such as reading sensor data and updating device settings.

### Handlers

- `websocketMessageHandler.js`: Handles incoming WebSocket connections and messages. It delegates tasks to the appropriate controller functions and manages error handling.

### Services

- `websocketClient.js`: Manages the WebSocket client logic, including establishing connections, handling reconnections, and managing the client-side WebSocket lifecycle.
- `websocketService.js`: Placeholder for any additional WebSocket-related services that might be required.

### Utils

- `websocketUtils.js`: Contains utility functions for sending messages and handling errors within the WebSocket context.

### WebSocket Server

- `websocketServer.js`: Initializes and manages the WebSocket server. It sets up the server to handle incoming WebSocket connections and integrates it with the Express application.

## Usage

### Initializing the WebSocket Server

The WebSocket server is initialized within the `index.js` file of your main application. Here's an example of how to integrate it:

```javascript
const { initWebSocketServer } = require('./websocket/websocketServer');

// Initialize WebSocket server
const server = initWebSocketServer(app);

// Start the server
server.listen(port, () => {
  logger.info(`Server is listening on port ${port}`);
  logger.info(`Running latest version ${version}`);
});
```

### Initializing the WebSocket Client

The WebSocket client logic is handled by `websocketClient.js`. It manages the connection to a WebSocket server, including reconnection logic and message handling:

```javascript
const { initWebSocketClient } = require('./websocket/services/websocketClient');

// Initialize WebSocket client
initWebSocketClient();
```

### Handling WebSocket Messages

Messages received via WebSocket are processed by the `websocketMessageHandler.js`, which delegates the business logic to the appropriate controller methods in `websocketMessageController.js`.

### Message Types

All WebSocket message types are defined in `messageTypes.js`. This ensures consistency across the application:

```javascript
const MESSAGE_TYPES = {
  DEVICE_CONNECT: 'DEVICE_CONNECT',
  REQUEST_SENSOR_DATA: 'REQUEST_SENSOR_DATA',
  SENSOR_DATA_RESPONSE: 'SENSOR_DATA_RESPONSE',
  UPDATE_DEVICE_SETTINGS: 'UPDATE_DEVICE_SETTINGS',
  DEVICE_SETTINGS_UPDATE_ACK: 'DEVICE_SETTINGS_UPDATE_ACK',
  ERROR: 'ERROR'
};

module.exports = MESSAGE_TYPES;
```

## Error Handling

Errors within the WebSocket context are managed using the utility functions in `websocketUtils.js`. These utilities ensure consistent error logging and messaging:

```javascript
function handleError(ws, error) {
  const logger = require('../../common/config/logger');
  logger.error(`WebSocket error: ${error.message}`);
  sendMessage(ws, 'ERROR', { message: error.message });
  ws.close();
}
```

## Conclusion

This structure ensures that your WebSocket implementation is clean, modular, and maintainable. Each component has a clear responsibility, making the codebase easier to understand and extend. If you have any further questions or need more adjustments, please reach out.
