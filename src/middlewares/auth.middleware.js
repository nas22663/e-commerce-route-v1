import jwt from "jsonwebtoken";
import User from "../../DB/models/user.model.js";

export const auth = (accessRoles) => {
  return async (req, res, next) => {
    try {
      const { accesstoken } = req.headers;

      if (!accesstoken) return next(new Error("please log in", { cause: 400 }));

      if (!accesstoken.startsWith(process.env.TOKEN_PREFIX))
        return next(new Error("invalid prefix", { cause: 400 }));

      const token = accesstoken.split(process.env.TOKEN_PREFIX)[1];

      const decodedData = jwt.verify(token, process.env.LOGIN_SIGNATURE);

      if (!decodedData || !decodedData.id)
        return next(new Error("invalid token payload"), { cause: 400 });

      const findUser = await User.findById(
        decodedData.id,
        "username email role"
      );
      if (!findUser)
        return next(new Error("please sign up first"), { cause: 404 });

      // authorization check
      if (!accessRoles.includes(findUser.role))
        return next(new Error("you are not authorized"), { cause: 403 });

      req.authUser = findUser;

      next();
    } catch (error) {
      next(new Error("catch error in auth middleware"), { cause: 500 });
    }
  };
};
