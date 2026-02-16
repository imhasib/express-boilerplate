const Joi = require("joi");

const saveEmailSettings = {
  body: Joi.object().keys({
    key: Joi.string(),
    value: {
      smtp: {
        host: Joi.string(),
        port: Joi.number(),
        auth: {
          user: Joi.string(),
          pass: Joi.string(),
        },
        from: Joi.string(),
      },
    },
    description: Joi.string(),
  }),
};

const saveWhApiSettings = {
  body: Joi.object().keys({
    key: Joi.string(),
    value: {
      host: Joi.string(),
      token: Joi.string(),
      groupId: Joi.string(),
    },
    description: Joi.string(),
  }),
};

const getAppSettings = {
  query: Joi.object().keys({
    key: Joi.string().required(),
  }),
};

module.exports = {
  saveEmailSettings,
  saveWhApiSettings,
  getAppSettings,
};
