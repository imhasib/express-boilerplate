const Joi = require("joi");

const updateMe = {
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      mobile: Joi.string().trim().allow("", null),
    })
    .min(1),
};

module.exports = {
  updateMe,
};
