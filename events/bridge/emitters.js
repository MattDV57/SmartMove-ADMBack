// emitters.js
import { AdminEventDTO, ClaimEventDTO, ContractCancelEventDTO } from './emittersDto.js';
import { emitEvent } from './eventBridge.js';


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


export const emitConfirmContractEvent = async (contractData) => {

  const contractCancelDto = new ContractCancelEventDTO(contractData);

  await emitEvent({
    eventName,
    payload: contractCancelDto
  })
}
