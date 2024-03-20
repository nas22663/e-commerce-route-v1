import Joi from "joi";
import { Types } from "mongoose";

const objectIdvalidation = (value, helpers) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helpers.message("invalid id");
};

export const generalRules = {
  dbId: Joi.string().custom(objectIdvalidation),
  headersRules: Joi.object({
    accesstoken: Joi.string().required(),
    "content-type": Joi.string(),
    "content-length": Joi.string(),
    "user-agent": Joi.string(),
    host: Joi.string(),
    "accept-encoding": Joi.string(),
    "postman-token": Joi.string(),
    "cache-control": Joi.string(),
    "accept-language": Joi.string(),
    cookie: Joi.string(),
    accept: Joi.string(),
    connection: Joi.string(),
  }),
};
