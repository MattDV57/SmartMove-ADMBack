// emitters.js
import { sendEventToSQS } from '../utils/sqsService.js';
import emitEvent from './eventBridge.js';
import { OUTPUT_EVENTS } from './eventTypes.js';


// EJEMPLO PARA IMPLEMENTAR EL RESTO... no emitimos esto...
export const emitAdminCreated = async (userData) => {
  await emitEvent({
    eventType: 'AdministradorCreado', 
    payload: userData, 
  });
};

