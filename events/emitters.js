// emitters.js
import { sendEventToSQS } from '../utils/sqsService.js';
import emitEvent from './eventBridge.js';
import { OUTPUT_EVENTS } from './eventTypes.js';



export const emitAdminCreated = async (userData) => {
  await emitEvent({
    eventType: 'AdministradorCreado', 
    payload: userData, 
  });
};

