import mqtt from 'mqtt';

export const mqttClient = mqtt.connect('mqtts://broker.hivemq.com:8883', {
  clientId: `monopoly-server-game-${Math.random().toString(16).slice(2)}`,
  clean: true
});

mqttClient.on('connect', () => {
  console.log('MQTT connected')
});

mqttClient.on('error', (err) => {
  console.error('MQTT error', err)
});

export function publishGameEvent(roomCode, payload) {
  mqttClient.publish( `game/${roomCode}/events`,
    JSON.stringify({
      ...payload,
      timestamp: Date.now()
    })
  );
}
