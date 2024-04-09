import Joi from "joi";
import { generalRules } from "../../utils/general.validation.rules.js";

export const addCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().required().min(3).max(15).alphanum(),
    couponAmount: Joi.number().required().min(1),
    isFixed: Joi.boolean().required(),
    isPercentage: Joi.boolean().required(),
    fromDate: Joi.date()
      .greater(Date.now() - 24 * 60 * 60 * 1000)
      .required(),
    maxUsage: Joi.number().min(1),
    toDate: Joi.date().greater(Joi.ref("fromDate")).required(),
    Users: Joi.array().items(
      Joi.object({
        userId: generalRules.dbId,
        maxUsage: Joi.number().min(1),
      })
    ),
  }),
};
