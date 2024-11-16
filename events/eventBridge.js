import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { configClient } from "./configClient";


const eventBridge = new EventBridgeClient(configClient);

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
