export const globalResponse = (err, req, res, next) => {
  if (err) {
    res.status(err["cause"] || 500).json({
      message: "catch error",
      errMsg: err.message,
      errLocation: err.stack,
    });
  }

  next();
};
