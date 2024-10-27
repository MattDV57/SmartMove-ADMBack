const messageTemplateCodeWords = {
  //Funcionalidad
  "Volver a menú": "primer_mensaje_bienvenida",
  "Terminar el chat": "servidores_estado_caido",

  //Botones de reclamo
  "Generar un reclamo": "servidores_estado_caido",
  "Problema con alquiler": "servidores_estado_caido",
  "Problema con dueño": "servidores_estado_caido",
  "Maltrato personal": "servidores_estado_caido",
  "Intento de estafa": "servidores_estado_caido",
  "Oferta engañosa": "servidores_estado_caido",
  "Problema con pagos": "servidores_estado_caido",
  "Pago no recibido": "servidores_estado_caido",
  "No puedo enviar pago": "servidores_estado_caido",
  "Realizar queja": "servidores_estado_caido",
  "Mal servicio": "servidores_estado_caido",
  "Mal soporte": "servidores_estado_caido",
  "Mala experiencia": "servidores_estado_caido",

  //Botones de soporte técnico
  "Soporte técnico": "servidores_estado_caido",
  "No puedo registrarme": "servidores_estado_caido",
  "No puedo ingresar": "servidores_estado_caido",
  "Sitio web no funciona": "servidores_estado_funcionando",
};

const getTemplateByCode = async (code) => {
  const response = messageTemplateCodeWords[code];
  if (response == undefined) {
    return null;
  }
  if (response.length == 0) {
    return null;
  }
  return response;
};

export default getTemplateByCode;
