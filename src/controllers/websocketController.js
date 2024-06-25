const readRegister = require('../services/readRegister');
const modbusClient = require('../services/modbusClient');

async function handleMessage(ws, message) {
  const parsedMessage = JSON.parse(message);

  switch (parsedMessage.type) {
    case 'READ_DATA':
      await handleReadData(ws);
      break;
    case 'UPDATE_REGISTER':
      await handleUpdateRegister(ws, parsedMessage);
      break;
    default:
      console.log('Unknown message type:', parsedMessage.type);
  }
}

async function handleReadData(ws) {
  const data = await readRegister();
  const serialNumber = data.find(
    (item) => item.tagName === 'systemSerialNumberWriteOnly'
  ).value;
  ws.send(JSON.stringify({ type: 'DATA_RESPONSE', serialNumber, data }));
}

async function handleUpdateRegister(ws, message) {
  const { registerAddress, newValue } = message;
  await modbusClient.writeRegister(registerAddress, newValue);
  ws.send(JSON.stringify({ type: 'UPDATE_ACK', registerAddress, newValue }));
}
//
module.exports = { handleMessage };
