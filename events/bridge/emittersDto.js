

export class AdminEventDTO {
    constructor(userData) {
      const [name, lastname] = userData.fullName.split(" ");
      this.name = name;
      this.lastname = lastname;
      this.username = userData.username;
      this.email = userData.email;
      this.password = userData.password;
      this.cuit = userData.cuit;
    }
}

export class ClaimEventDTO {
  constructor(claimData) {
    this.status = claimData.status;
    this.priority = claimData.priority;
    this.user = claimData.user.username;
    this.supportOperator = claimData.assignedOperator;
    this.description = claimData.description;
    this.subject = claimData.subject;
    this.category = claimData.category;
    this.resolution = claimData.resolution;
  }
}

export class ContractCancelEventDTO {
  constructor(contractData) {
    this.contractId = contractData.contractId;
    this.hasOpenClaims = contractData.hasOpenClaims;
  } 
}
