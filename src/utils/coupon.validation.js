import Coupon from "../../DB/models/coupon.model.js";
import CouponUsers from "../../DB/models/coupon-users.model.js";
import { DateTime } from "luxon";

export const couponValidation = async (couponCode, userId) => {
  const coupon = await Coupon.findOne({ couponCode });
  if (!coupon) {
    return { msg: "Coupon not found", status: 404 };
  }

  if (
    coupon.couponStatus === "expired" ||
    DateTime.fromISO(coupon.toDate) < DateTime.now()
  ) {
    return { msg: "Coupon expired", status: 400 };
  }

  if (DateTime.now() < DateTime.fromISO(coupon.fromDate)) {
    return { msg: "Coupon not yet started", status: 400 };
  }

  if (!coupon.isPublic) {
    const isUserAssigned = await CouponUsers.findOne({
      couponId: coupon._id,
      userId,
    });
    //   console.log(isUserAssigned);
    if (!isUserAssigned) {
      return { msg: "Coupon not assigned to this user", status: 400 };
    }

    //   maxusage check

    if (isUserAssigned.usageCount >= isUserAssigned.maxUsage) {
      return { msg: "Coupon usage limit reached", status: 400 };
    }
  }

  return coupon;
};
