import Coupon from "../../../DB/models/coupon.model.js";
import CouponUsers from "../../../DB/models/coupon-users.model.js";
import User from "../../../DB/models/user.model.js";
import { couponValidation } from "../../utils/coupon.validation.js";

//==================================Add Coupon API==================================

export const addCoupon = async (req, res, next) => {
  const {
    couponCode,
    couponAmount,
    isFixed,
    isPercentage,
    fromDate,
    toDate,
    Users,
    maxUsage,
  } = req.body;
  const { _id: addedBy } = req.authUser;

  const isCouponCodeExist = await Coupon.findOne({ couponCode });
  if (isCouponCodeExist) {
    return next(new Error("coupon code already exist", { cause: 409 }));
  }

  if (isFixed == isPercentage) {
    return next(
      new Error("Coupon is either fixed or percentage", { cause: 400 })
    );
  }

  if (isPercentage && couponAmount > 100) {
    return next(
      new Error("Coupon percentage cannot be greater than 100", { cause: 400 })
    );
  }

  const couponObject = {
    couponCode,
    couponAmount,
    isFixed,
    isPercentage,
    fromDate,
    toDate,
    addedBy,
  };

  const coupon = await Coupon.create(couponObject);

  if (Users) {
    coupon.isPublic = false;
    await coupon.save();
    console.log(coupon.isPublic);
    let userIds = [];
    for (const user of Users) {
      userIds.push(user.userId);
    }

    const isUserExist = await User.find({ _id: { $in: userIds } });

    if (isUserExist.length != userIds.length) {
      return next(new Error("User not found", { cause: 404 }));
    }

    const couponUsers = await CouponUsers.create(
      Users.map((user) => ({ ...user, couponId: coupon._id }))
    );
    return res
      .status(201)
      .json({ message: "Coupon added successfully", couponUsers, coupon });
  }

  return res.status(201).json({ message: "Coupon added successfully", coupon });
};

/**
 * getAllCoupons
 * getCouponByCode
 * updateCoupon
 * deleteCoupon
 */

export const validateCoupon = async (req, res, next) => {
  const { code } = req.body;
  const { _id: userId } = req.authUser;

  const isCouponValid = await couponValidation(code, userId);
  if (isCouponValid.msg) {
    return next(new Error(isCouponValid.msg, { cause: isCouponValid.status }));
  }
};
