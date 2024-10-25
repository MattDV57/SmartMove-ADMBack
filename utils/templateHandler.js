const messageTemplateCodeWords = {
  //Funcionalidad
  "Volver a menú": "primer_mensaje_bienvenida",
  "Terminar el chat": "",

  //Botones de reclamo
  "Generar un reclamo": "",
  "Problema con alquiler": "",
  "Problema con dueño": "",
  "Maltrato personal": "",
  "Intento de estafa": "",
  "Oferta engañosa": "",
  "Problema con pagos": "",
  "Pago no recibido": "",
  "No puedo enviar pago": "",
  "Realizar queja": "",
  "Mal servicio": "",
  "Mal soporte": "",
  "Mala experiencia": "",

  //Botones de soporte técnico
  "Soporte técnico": "servidores_estado_caido",
  "No puedo registrarme": "",
  "No puedo ingresar": "",
  "Sitio web no funciona": "servidores_estado_caido",
};

const getTemplateByCode = async (code) => {
  const response = messageTemplateCodeWords[code];
  if (response == undefined) {
    return "primer_mensaje_bienvenida";
  }
  return response;
};

export default getTemplateByCode;
