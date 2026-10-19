require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 3333,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-troque-em-producao',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  dbDriver: process.env.DB_DRIVER || 'memory',
  databaseUrl: process.env.DATABASE_URL,
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxImageSizeBytes: 5 * 1024 * 1024,
};
