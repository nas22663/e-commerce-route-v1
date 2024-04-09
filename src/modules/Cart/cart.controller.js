import Cart from "../../../DB/models/cart.model.js";
import Product from "../../../DB/models/product.model.js";
import { addCart } from "./utils/add-cart.js";
import { checkProductAvailability } from "./utils/check-product-in-db.js";
import { getUserCart } from "./utils/get-user-cart.js";

export const addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { _id } = req.authUser;

  const product = await checkProductAvailability(productId, quantity);
  if (!product) {
    return next(
      new Error("product not found or Not available", { cause: 404 })
    );
  }

  const userCart = await getUserCart(_id);

  if (!userCart) {
    const cart = await addCart(_id, product, quantity);

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: cart,
    });
  }

  let productExist = false;
  let subTotal = 0;
  userCart.products.forEach((cartProduct) => {
    if (cartProduct.productId.toString() === productId.toString()) {
      cartProduct.quantity = quantity; // Update quantity
      cartProduct.finalPrice = cartProduct.basePrice * cartProduct.quantity; // Recalculate finalPrice
      productExist = true;
    }
  });

  if (!productExist) {
    userCart.products.push({
      productId,
      quantity: quantity,
      basePrice: product.appliedPrice,
      finalPrice: product.appliedPrice * quantity,
      title: product.title,
    });
  }

  for (const product of userCart.products) {
    subTotal += product.finalPrice;
  }

  userCart.subTotal = subTotal;

  const updatedCart = await userCart.save();
  return res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    data: updatedCart,
  });
};

export const removeFromCart = async (req, res, next) => {
  const { productId } = req.params;
  const { _id } = req.authUser;

  const userCart = await Cart.findOne({
    userId: _id,
    "products.productId": productId,
  });
  if (!userCart) return next(new Error("product not found", { cause: 404 }));

  // Remove product from cart
  userCart.products = userCart.products.filter(
    (cartProduct) => cartProduct.productId.toString() !== productId
  );

  let subTotal = 0;
  for (const product of userCart.products) {
    subTotal += product.finalPrice;
  }

  userCart.subTotal = subTotal;

  const updatedCart = await userCart.save();

  if (updatedCart.products.length === 0) {
    await Cart.findByIdAndDelete(updatedCart._id);
  }

  return res.status(200).json({
    success: true,
    message: "Product removed from cart successfully",
  });
};
