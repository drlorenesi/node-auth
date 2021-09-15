const smtp = require('./smtp');

module.exports = async (nombre, email, codigoVerificador) => {
  let link = `${process.env.URL_API}/v1/usuarios/activar?x=${encodeURIComponent(
    email
  )}&y=${codigoVerificador}`;

  let err;
  try {
    await smtp.sendMail({
      from: `"Notificaciones 🍫" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Por Favor Activa tu Cuenta',
      html: `<h3>¡Hola ${nombre}!</h3>
          <p>Gracias por registrarte. Por favor haz click en el link de abajo para activar tu cuenta:</p>
          <p><a href="${link}">${link}</a></p>`,
    });
  } catch (error) {
    err = error.response;
  }
  // Retornar 'err' para evitar que el resto del código se ejecute.
  return err;
};
