import Cart from "../../../../DB/models/cart.model.js";

export const addCart = async (userId, product, quantity) => {
  const cartObj = {
    userId,
    products: [
      {
        productId: product._id,
        quantity: quantity,
        basePrice: product.appliedPrice,
        finalPrice: product.appliedPrice * quantity,
        title: product.title,
      },
    ],
    subTotal: product.appliedPrice * quantity,
  };

  const cart = await Cart.create(cartObj);
  return cart;
};
