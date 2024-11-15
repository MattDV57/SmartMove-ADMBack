export const INPUT_EVENTS = {
  LEGAL: {
    LOG_CONTRACT_SIGNED: 'contractSigned',
    REQUEST_CONTRACT_CANCELATION: 'SolicitudCancelacionContratoCreada'

  },
  ACCOUNTING: {
    LOG_PAYMENT_MADE: 'PagoMudanzaRealizada'
  },
  REAL_ESTATE: {
    LOG_PROPERTY_LISTED: 'PublicacionCreada'
  },
  USER: {
    LOG_USER_CREATED: 'UsuarioCreado',
    CLAIM_CREATED: 'ReclamoCreado'
  },
  LOGISTICS: {
    LOG_MOVE_SCHEDULED: 'MudanzaSolicitada'
  }
}

export const OUTPUT_EVENTS = {
  ANALITYCS: {
    ADMIN_CREATED: 'AdministradorCreado', // Analitica y Usuarios
    ADMIN_UPDATED: 'AdministradorModificado', // Analitica y Usuarios
    ADMIN_DELETED: 'AdministradorEliminado', // Analitica y Usuarios
    CLAIM_UPDATED: 'ReclamoModificado',
    CONFIRM_CONTRACT_CANCELATION: 'ConfirmarCancelacionContrato' // Legales
  }
}
