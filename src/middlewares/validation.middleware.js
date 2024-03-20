const reqKeys = ["body", "params", "query", "headers"];

export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    let validationErrorsArray = [];
    for (const key of reqKeys) {
      if (typeof schema[key]?.validate === "function") {
        const validationResult = schema[key].validate(req[key], {
          abortEarly: false,
        });
        if (validationResult?.error) {
          validationErrorsArray.push(...validationResult.error.details);
        }
      }
    }

    if (validationErrorsArray.length > 0) {
      return res.status(400).json({
        err_msg: "Validation error",
        errors: validationErrorsArray.map((ele) => ele.message),
      });
    }

    next();
  };
};
