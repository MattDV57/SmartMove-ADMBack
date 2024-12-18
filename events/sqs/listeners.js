// listeners.js
import { Claim } from '../../models/claimModel.js';
import { ClaimCreateDTO } from './listenersDto.js';
import { INPUT_EVENTS, MODULE_NAME_MAP, OUTPUT_EVENTS } from '../eventNames.js';
import { Log } from '../../models/logModel.js';
import { emitConfirmContractEvent } from '../bridge/emitters.js';


export const processEvent = async (rawEvent) => {
  const body = JSON.parse(rawEvent.Body);

  const event = { name: body['detail-type'], timestamp: body.time, data: body.detail };

  console.log("Proccesing event...", event.name);
 
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
    // performedBy: event.data?.performedBy || 'Anonimo',
    timestamp: event.timestamp
  })
}


export const handleClaimCreated = async (event) => {

  const newClaim = new ClaimCreateDTO(event.data);
  await Claim.create(newClaim);

};

const handleRequestContractCancelation = async (event) => {

  const filter = {'user.cuit': event.data.userId, status: "Abierto" };
  const countOpenClaims = await Claim.countDocuments(filter);
  const hasOpenClaims = countOpenClaims === 0;

  if (hasOpenClaims) {
    await emitConfirmContractEvent(
      event.data.contractId, 
      OUTPUT_EVENTS.CONFIRM_CONTRACT_CANCELATION
    );
  }



};



