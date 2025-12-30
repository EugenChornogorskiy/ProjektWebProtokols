import mqtt from 'mqtt';
import fs from 'fs';

const client = mqtt.connect('mqtts://broker.hivemq.com:8883', {
  clientId: `monopoly-server-game-${Math.random().toString(16).slice(2)}`,
  clean: true
}) 

client.on('connect', () => {
  client.subscribe('game/+/events');
  console.log('Observer subscribed');
});

client.on('message', (topic, message) => {
  const log = `[${new Date().toISOString()}] ${topic}: ${message.toString()}\n`;
  fs.appendFileSync('game.log', log);
});
