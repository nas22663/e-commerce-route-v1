import couponUsersModel from "../../../DB/models/coupon-users.model.js";
import Order from "../../../DB/models/order.model.js";
import Product from "../../../DB/models/product.model.js";
import Cart from "../../../DB/models/cart.model.js";
import { couponValidation } from "../../utils/coupon.validation.js";
import { checkProductAvailability } from "../Cart/utils/check-product-in-db.js";
import { getUserCart } from "../Cart/utils/get-user-cart.js";
import { DateTime } from "luxon";

export const createOrder = async (req, res, next) => {
  const { _id: userId } = req.authUser;
  const {
    product,
    quantity,
    couponCode,
    paymentMethod,
    phoneNumbers,
    address,
    city,
    postalCode,
    country,
  } = req.body;

  //coupon check
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await couponValidation(couponCode, userId);
    if (isCouponValid.status) {
      return next({ message: isCouponValid.msg, cause: isCouponValid.status });
    }
    coupon = isCouponValid;
  }

  //product check

  const isProductAvailable = await checkProductAvailability(product, quantity);
  if (!isProductAvailable) {
    return next(
      new Error("product not found or Not available", { cause: 404 })
    );
  }

  let orderItems = [
    {
      title: isProductAvailable.title,
      quantity,
      price: isProductAvailable.appliedPrice,
      product: isProductAvailable._id,
    },
  ];

  let shippingPrice = orderItems[0].price * quantity;
  let totalPrice = shippingPrice;

  if (coupon) {
    if (coupon.isFixed && coupon.couponAmount <= shippingPrice) {
      totalPrice = totalPrice - coupon.couponAmount;
    } else if (coupon.isPercentage) {
      totalPrice = totalPrice - (totalPrice * coupon.couponAmount) / 100;
    } else {
      return next({
        message: "coupon is not valid or bigger than the the price ",
        cause: 400,
      });
    }
    if (!coupon.isPublic) {
      console.log(coupon.isPublic);
      await couponUsersModel.updateOne(
        {
          couponId: coupon._id,
          userId,
        },
        {
          $inc: {
            usageCount: 1,
          },
        }
      );
    }
  }
  // orderstatus & paymentMethod
  let orderStatus = "Pending";
  if (paymentMethod === "Cash") orderStatus = "Placed";

  //createOrder
  const order = new Order({
    user: userId,
    orderItems,
    shippingAddress: {
      address,
      city,
      postalCode,
      country,
    },
    phoneNumbers,
    shippingPrice,
    coupon,
    totalPrice,
    paymentMethod,
    orderStatus,
  });

  await order.save();

  isProductAvailable.stock = isProductAvailable.stock - quantity;
  await isProductAvailable.save();

  res.status(200).json({ message: "order created successfully", data: order });
};

export const cartToOrder = async (req, res, next) => {
  const { _id: userId } = req.authUser;
  const {
    couponCode,
    paymentMethod,
    phoneNumbers,
    address,
    city,
    postalCode,
    country,
  } = req.body;

  //cart check
  const userCart = await getUserCart(userId);
  if (!userCart) {
    return next(new Error("cart not found", { cause: 404 }));
  }
  //coupon check
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await couponValidation(couponCode, userId);
    if (isCouponValid.status) {
      return next({ message: isCouponValid.msg, cause: isCouponValid.status });
    }
    coupon = isCouponValid;
  }

  //product check

  // const isProductAvailable = await checkProductAvailability(product, quantity);
  // if (!isProductAvailable) {
  //   return next(
  //     new Error("product not found or Not available", { cause: 404 })
  //   );
  // }

  let orderItems = userCart.products.map((product) => {
    return {
      title: product.title,
      quantity: product.quantity,
      price: product.basePrice,
      product: product.productId,
    };
  });

  let shippingPrice = userCart.subTotal;
  let totalPrice = shippingPrice;

  if (coupon) {
    if (coupon.isFixed && coupon.couponAmount <= shippingPrice) {
      totalPrice = totalPrice - coupon.couponAmount;
    } else if (coupon.isPercentage) {
      totalPrice = totalPrice - (totalPrice * coupon.couponAmount) / 100;
    } else {
      return next({
        message: "coupon is not valid or bigger than the the price ",
        cause: 400,
      });
    }
    if (!coupon.isPublic) {
      await couponUsersModel.updateOne(
        {
          couponId: coupon._id,
          userId,
        },
        {
          $inc: {
            usageCount: 1,
          },
        }
      );
    }
  }
  // orderstatus & paymentMethod
  let orderStatus = "Pending";
  if (paymentMethod === "Cash") orderStatus = "Placed";

  //createOrder
  const order = new Order({
    user: userId,
    orderItems,
    shippingAddress: {
      address,
      city,
      postalCode,
      country,
    },
    phoneNumbers,
    shippingPrice,
    coupon,
    totalPrice,
    paymentMethod,
    orderStatus,
  });

  await order.save();

  await Cart.findByIdAndDelete(userCart._id);

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    product.stock = product.stock - item.quantity;
    await product.save();
  }

  res.status(200).json({ message: "order created successfully", data: order });
};

export const orderDelivery = async (req, res, next) => {
  const { orderId } = req.params;

  const updateOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      orderStatus: { $in: ["Paid", "Placed"] },
    },
    {
      orderStatus: "Delivered",
      deliverdBy: req.authUser._id,
      deliveredAt: DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      isDelivered: true,
    },
    {
      new: true,
    }
  );
  if (!updateOrder) {
    return next(new Error("order not found", { cause: 404 }));
  }
  res
    .status(200)
    .json({ message: "order delivered successfully", data: updateOrder });
};
