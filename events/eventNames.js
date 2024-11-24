export const INPUT_EVENTS = {
  LOGS: {
    LEGAL: ['NuevoContratoInmueble'], //TODO
    ACCOUNTING: ['PagoRealizado'],   //TODO
    REAL_ESTATE: ['PublicacionCreada'], 
    USER: ['UsuarioCreado', 'UsuarioModificado', "UsuarioEliminado"],
    LOGISTICS: ['MudanzaSolicitada'],
  },
  LEGAL: {
    REQUEST_CONTRACT_CANCELATION: 'SolicitudCancelaciónContratoCreada'
  },
  ACCOUNTING: {
  },
  REAL_ESTATE: {
  },
  USER: {
    CLAIM_CREATED: 'ReclamoCreado'
  },
  LOGISTICS: {
  }
  
}


export const OUTPUT_EVENTS = {
  ADMIN_CREATED: 'AdministradorCreado', // Analitica y Usuarios
  ADMIN_UPDATED: 'AdministradorModificado', // Analitica y Usuarios
  ADMIN_DELETED: 'AdministradorEliminado', // Analitica y Usuarios
  CLAIM_UPDATED: 'ReclamoModificado',
  CONFIRM_CONTRACT_CANCELATION: 'SolicitudCancelacionContratoAprobado' // Legales
}


export const MODULE_NAME_MAP  = {
  USER: "Usuarios",
  LEGAL: "Legales",
  ACCOUNTING: "Contable",
  REAL_ESTATE: "Inmuebles",
  LOGISTICS: "Logística",
  ANALITYCS: "Analítica"
}
