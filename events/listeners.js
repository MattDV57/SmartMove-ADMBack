// listeners.js
import { Log } from '../Models/logModel.js';
import { INPUT_EVENTS, MODULE_NAME_MAP } from './eventTypes.js';


export const processEvent = async (rawEvent) => {
  const body = JSON.parse(rawEvent.Body);

  console.log("Proccesing event...")

  const event = { name: body['detail-type'], timestamp: body.time, data: body.detail };

  const { module, eventType } = findModuleAndEventType(event.name);

  if (eventType === 'LOGS') {
    await handleCreateLog(event, module);
    return;
  }

  switch (event.name) {
    case `${INPUT_EVENTS.USER.CLAIM_CREATED}`:
      await handleClaimCreated(event);
      break;
    case `${INPUT_EVENTS.LEGAL.REQUEST_CONTRACT_CANCELATION}`:
      await handleRequestContractCancelation(event);
      break;

    default:
      console.warn(`No hay un handler definido para el evento: ${event.name}`);
  }
};


const findModuleAndEventType = (eventName) => {
  for (const [module, events] of Object.entries(INPUT_EVENTS.LOGS)) {
    if (events.includes(eventName)) {
      return { module, eventType: "LOGS" };
    }
  }
  return { module: '', eventType: "OTHER" };
}

const handleCreateLog = async (event, module) => {
  await Log.create({
    eventType: event.name,
    moduleEmitter:  MODULE_NAME_MAP[module],
    performedBy: event.data?.performedBy || 'Anonimo',
    timestamp: event.timestamp
  })
}


const handleClaimCreated = async (event) => {
  console.log("Procesando evento de Reclamo Creado:", event);

};

const handleRequestContractCancelation = async (event) => {
  console.log("Procesando evento de Contrato Firmado:", event);

};
