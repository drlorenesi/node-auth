module.exports = () => {
  if (!process.env.FIRMA_JWT) {
    console.error('ERROR TERMINAL: FIRMA_JWT no está definida.');
    process.exit(1);
  }
  if (!process.env.URL_MONGO) {
    console.error('ERROR TERMINAL: URL_MONGO no está definido.');
    process.exit(1);
  }
  if (!process.env.URL_API) {
    console.error('ERROR TERMINAL: URL_API no está definido.');
    process.exit(1);
  }
};
