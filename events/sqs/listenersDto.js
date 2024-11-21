

export class ClaimCreateDTO {
    constructor(claimData) {
        this.description =  claimData.descripcion;
        this.category = claimData.categoria;
        this.subject = claimData.asunto;
        this.user = {
            username: claimData.usernameReclamante,
            fullName: claimData.nombreReclamante + " " + claimData.apellidoReclamante
        };
        this.infractor = {
          username: claimData.usernameInfractor,
          fullName: claimData.nombreInfractor + " " +  claimData.apellidoInfractor
        };
        this.priority = this.calculatePriority();
    }

    calculatePriority() {
        let score = CATEGORY_WEIGHTS[this.category] || 0;
        
        const urgencyKeywords = ["urgente", "crítico", "inmediato"];
        const containsUrgencyKeyword = urgencyKeywords.some((keyword) =>
          (this.description || "").toLowerCase().includes(keyword) ||
          (this.subject || "").toLowerCase().includes(keyword)
        );

        if (containsUrgencyKeyword) {
          score += 40;
        }

        if (score >= 80) return "Urgente";
        if (score >= 50) return "Alta";
        if (score >= 20) return "Normal";
        return "Consulta";
    }

}



const CATEGORY_WEIGHTS = {
    "Técnicos": 50,
    "Cobros/Pagos": 40,
    "Servicio": 30,
    "Mediaciones": 20,
    "Información": 10,
    "Perfil/Usuario": 15,
    "Inmuebles": 25,
    "Contrato": 35,
    "Servicio de Mudanza": 45,
    "Otros": 5,
  };