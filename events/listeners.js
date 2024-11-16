// listeners.js
import { Log } from '../Models/logModel.js';
import { INPUT_EVENTS, OUTPUT_EVENTS } from './eventTypes.js';


export const processEvent = async (event) => {
  const { eventName, payload } = JSON.parse(event.Body);
    console.log("Proccesing event...")
  switch (eventName) {
    case `${INPUT_EVENTS.USER.LOG_USER_CREATED}`:
      await handleUserCreated(payload);
      break;
    case `${INPUT_EVENTS.USER.CLAIM_CREATED}`:
      await handleClaimCreated(payload);
      break;
    case `${INPUT_EVENTS.LEGAL.LOG_CONTRACT_SIGNED}`:
      await handleContractSigned(payload);
      break;
    case `${INPUT_EVENTS.ACCOUNTING.LOG_PAYMENT_MADE}`:
      await handlePaymentMade(payload);
      break;

    default:
      console.warn(`No hay un handler definido para el evento: ${eventName}`);
  }
};


const handleUserCreated = async (data) => {
  console.log("Procesando evento de Usuario Creado:", data);
  await Log.create({
    eventType: `${INPUT_EVENTS.USER.LOG_USER_CREATED}`,
    moduleEmitter: "Usuarios",
    performedBy: userData.createdBy || 'Nuevo usuario'
  })

};

const handleClaimCreated = async (data) => {
  console.log("Procesando evento de Reclamo Creado:", data);

};


const handleContractSigned = async (data) => {
  console.log("Procesando evento de Contrato Firmado:", data);

};

const handlePaymentMade = async (data) => {
  console.log("Procesando evento de Pago Realizado:", data);

};
