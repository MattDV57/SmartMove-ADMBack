import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { configClient } from '../configClient.js';


const eventBridgeClient = new EventBridgeClient(configClient);

const emitEvent = async ({ eventName, payload }) => {

  const params = {
    Entries: [
      {
        Source: 'SmartMove', 
        DetailType: eventName, 
        Detail: JSON.stringify(payload), 
        EventBusName: process.env.EVENT_BUS_ARN, 
      },
    ],
  };

  try {

    const command = new PutEventsCommand(params);
    await eventBridgeClient.send(command);
    console.log(`Evento ${eventName} enviado a EventBridge con éxito.`);

  } catch (error) {
    console.error(`Error al enviar el evento ${eventName} a EventBridge: `, error);
  }
};

export default emitEvent;
