const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    GOOGLE_CLIENT_ID: Joi.string().required().description('Google OAuth client ID'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SERVER_HOST: Joi.string().default('http://localhost').description('Server address of the express-boilerplate server.'),
    SERVER_BASE_URL: Joi.string().description('Base URL of the server.'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {},
  },
  log: {
    location: envVars.LOG_FILES_LOCATION,
  },
  server: {
    host: envVars.SERVER_HOST,
    apiVersion: envVars.SERVER_API_VERSION,
    baseUrl: envVars.SERVER_BASE_URL || `${envVars.SERVER_HOST}:${envVars.PORT}/${envVars.SERVER_API_VERSION}`,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  google: {
    clientId: envVars.GOOGLE_CLIENT_ID,
  },
  // email: {
  //   smtp: {
  //     host: envVars.SMTP_HOST,
  //     port: envVars.SMTP_PORT,
  //     auth: {
  //       user: envVars.SMTP_USERNAME,
  //       pass: envVars.SMTP_PASSWORD,
  //     },
  //   },
  //   from: envVars.EMAIL_FROM,
  // },
  whatsApp: {
    host: envVars.WA_HOST,
    appId: envVars.WA_APP_ID,
    appSecret: envVars.WA_APP_SECRET,
    recipientWAId: envVars.WA_RECIPIENT_WAID,
    version: envVars.WA_VERSION,
    phoneNumberId: envVars.WA_PHONE_NUMBER_ID,
    accessToken: envVars.WA_ACCESS_TOKEN,
  },
  // whApi: {
  //   host: envVars.WHAPI_HOST,
  //   token: envVars.WHAPI_TOKEN,
  //   groupId: envVars.WHAPI_GROUP_ID,
  // },
  snapshot: {
    host: envVars.SNAPSHOT_HOST,
    loginPath: envVars.SNAPSHOT_LOGIN_PATH,
    loginUserName: envVars.SNAPSHOT_LOGIN_USER_NAME,
    loginPassword: envVars.SNAPSHOT_LOGIN_PASSWORD,
    loginFieldUserNameId: envVars.SNAPSHOT_LOGIN_USER_NAME_FIELD_ID,
    loginFieldPasswordId: envVars.SNAPSHOT_LOGIN_PASSWORD_FIELD_ID,
    targetPath: envVars.SNAPSHOT_TARGET_PATH,
    selectorId: envVars.SNAPSHOT_SELECTOR_ID,
  },
};
