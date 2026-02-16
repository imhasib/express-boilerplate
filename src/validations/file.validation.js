const Joi = require("joi");
const { objectId } = require("./custom.validation");

const getFile = {
  params: Joi.object().keys({
    fileId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getFile,
};
