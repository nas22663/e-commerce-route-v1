import { scheduleJob } from "node-schedule";
import Coupon from "../../DB/models/coupon.model.js";
import { DateTime } from "luxon";

export const cronToChangeExpiredCoupon = () => {
  scheduleJob("0 0 1 * * *", async () => {
    console.log("running a task every 1 day");
    const coupons = await Coupon.find({ couponStatus: "valid" });
    // console.log(coupons);
    // console.log({
    //   now: moment(),
    //   toDate: moment(coupons[0].toDate),
    // });

    for (const coupon of coupons) {
      if (DateTime.fromISO(coupon.toDate) < DateTime.now()) {
        coupon.couponStatus = "expired";
        await coupon.save();
      }
    }
  });
};
