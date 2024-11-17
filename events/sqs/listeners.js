// listeners.js
import { Claim } from '../../models/claimModel.js';
import { ClaimCreateDTO } from './listenersDto.js';
import { INPUT_EVENTS, MODULE_NAME_MAP, OUTPUT_EVENTS } from '../eventNames.js';
import { Log } from '../../models/logModel.js';
import { emitConfirmContractEvent } from '../bridge/emitters.js';


export const processEvent = async (rawEvent) => {
  const body = JSON.parse(rawEvent.Body);

  console.log("Proccesing event...")

  const event = { name: body['detail-type'], timestamp: body.time, data: body.detail };

  console.log("\nEVENT NAME FROM SQS: ", event.name + "\n")

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


export const handleClaimCreated = async (event) => {

  const newClaim = new ClaimCreateDTO(event.data);
  await Claim.create(newClaim);

};

const handleRequestContractCancelation = async (event) => {
  //TODO contract_id ? Para que? Quieren que les respondamos de forma inmediata? Que generemos una noti?
  const filter = {'user.username': event.data.username, status: "Abierto" };
  const hasOpenClaims = Claim.countDocuments([
    { $match: { ...Filter } }
  ]) === 0;

  await emitConfirmContractEvent({contractId :event.data.contract_id, hasOpenClaims}, OUTPUT_EVENTS.CONFIRM_CONTRACT_CANCELATION);

};



