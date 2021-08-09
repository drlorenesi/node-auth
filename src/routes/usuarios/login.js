const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { compare } = require('bcryptjs');
const validar = require('../../middleware/validar');
const crearSesion = require('../../utils/crearSesion');
const crearTokens = require('../../utils/crearTokens');
const Usuario = require('../../models/usuario');
const Sesion = require('../../models/sesion');

const validarLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    pass: Joi.string().required(),
  });
  return schema.validate(data);
};

// Posibles errores
// 400 - Email o contraseña inválida.
// 401 - Tu cuenta aun no ha sido verificada.
// 403 - Tu cuenta se encuentra temporalmente suspendida.

router.post('/', [validar(validarLogin)], async (req, res) => {
  // Buscar a usuario
  const usuario = await Usuario.findOne({
    email: req.body.email,
  });
  if (!usuario)
    return res.status(400).send({ mensaje: 'Email o contraseña inválida.' });
  // Revisar si el usuario ya fue verificado
  if (!usuario.verificado)
    return res
      .status(401)
      .send({ mensaje: 'Tu cuenta aun no ha sido verificada.' });
  // Obtener pass de usuario
  const savedPassword = usuario.pass;
  // Comparar pass con la guardada en DB
  const concuerda = await compare(req.body.pass, savedPassword);
  if (!concuerda)
    return res.status(400).send({ mensaje: 'Email o contraseña inválida.' });
  // Revisar si el usuario ha sido suspendido
  if (usuario.suspendido)
    return res
      .status(403)
      .send({ mensaje: 'Tu cuenta se encuentra temporalmente suspendida.' });
  // Revisar si el usuario tiene sesiones activas
  const sesionesActivas = await Sesion.find({ 'usuario._id': usuario._id });
  if (sesionesActivas.length > 0) {
    // Permitir solo 1 sesión activa a la vez
    await Sesion.deleteMany({ 'usuario._id': usuario._id });
    // Crear nueva sesion
    const sesionId = await crearSesion(usuario._id, req);
    // Crear nuevos tokens
    crearTokens(sesionId, usuario, res);
    return res.send({
      mensaje:
        'Tu sesión ha iniciado. Por motivos de seguridad tu sesión anterior fue eliminada.',
    });
  }
  // Si no hay sesión activa crear una nueva
  const sesionId = await crearSesion(usuario._id, req);
  // Crear y enviar tokens
  crearTokens(sesionId, usuario, res);
  res.send({ mensaje: 'Tu sesión ha iniciado.' });
});

module.exports = router;
