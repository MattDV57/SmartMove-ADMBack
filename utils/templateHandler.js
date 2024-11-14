const messageTemplateCodeWords = {
  //Funcionalidad
  "Volver a menú": "primer_mensaje_bienvenida",
  "Terminar el chat": "servidores_estado_caido",

  //Botones de reclamo
  "Generar un reclamo": "generar_reclamo_menu",
  "Problema de alquiler": "reclamo_alquiler",
  "Muebles dañados": "reclamo_registrado",
  "Oferta engañosa": "reclamo_registrado",
  "Ambiente inaceptable": "reclamo_registrado",
  "Problema de pago": "generar_reclamo_pago",
  "Link de pago no funciona": "reclamo_registrado",
  "Pago no puede enviarse": "reclamo_registrado",
  "Maltrato personal": "servidores_estado_caido",
  Queja: "menu_queja",
  "Intento de estafa": "servidores_estado_caido",
  "Oferta engañosa": "reclamo_registrado",
  "Problema con pagos": "servidores_estado_caido",
  "Pago no recibido": "servidores_estado_caido",
  "No puedo enviar pago": "servidores_estado_caido",
  "Realizar queja": "servidores_estado_caido",
  "Mal servicio": "reclamo_registrado",
  "Mal soporte": "reclamo_registrado",
  "Mala experiencia": "reclamo_registrado",

  //Botones de soporte técnico
  "Soporte técnico": "ayuda_soporte",
  "Problema al ingresar": "ayuda_ingresar",
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
