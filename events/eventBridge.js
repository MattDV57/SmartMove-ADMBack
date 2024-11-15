import AWS from 'aws-sdk';
import 'dotenv/config'

const eventBridge = new EventBridgeClient({
  region: 'us-east-1', 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  
  },
});

const emitEvent = async ({ source, eventType, eventBusName, payload }) => {
  const eventName = `${source}_${eventType}`; 

  const params = {
    Entries: [
      {
        Source: 'administracion-interna', 
        DetailType: eventType, 
        Detail: JSON.stringify(payload), 
        EventBusName: process.env.EVENT_BUS_ARN, 
      },
    ],
  };

  try {
    await eventBridge.putEvents(params).promise();
    console.log(`Evento ${eventName} enviado a EventBridge con éxito.`);
  } catch (error) {
    console.error(`Error al enviar el evento ${eventName} a EventBridge: `, error);
  }
};

export default emitEvent;
