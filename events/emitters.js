// emitters.js
import { AdminEventDTO, ClaimEventDTO } from './emittersDto.js';
import emitEvent from './eventBridge.js';


export const emitAdminEvent = async (userData, eventName) => {
  const userDto = new AdminEventDTO(userData);

  await emitEvent({
    eventName,
    payload: userDto,
  });
};


export const emitClaimEvent = async (claimData, eventName) => {

  const claimDto = new ClaimEventDTO(claimData);

  await emitEvent({
    eventName,
    payload: claimDto
  })
}

//TODO
export const emitConfirmContractEvent = async () => {
  return;
}
