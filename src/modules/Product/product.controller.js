import slugify from "slugify";
import Product from "../../../DB/models/product.model.js";
import Brand from "../../../DB/models/brand.model.js";
import SubCategory from "../../../DB/models/sub-category.model.js";
import Category from "../../../DB/models/category.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";
import { systemRoles } from "../../utils/system-roles.js";
import { ApiFeatures } from "../../utils/api-features.js";

//=============================================add product controller=============================================

export const addProduct = async (req, res, next) => {
  //1- deconstruct data from req.body
  const { title, desc, stock, basePrice, discount, specs } = req.body;
  const { brandId, categoryId, subCategoryId } = req.query;
  const addedBy = req.authUser._id;

  //brand check
  const brand = await Brand.findById(brandId);
  if (!brand) return next(("brand not found", { cause: 404 }));
  if (brand.categoryId.toString() !== categoryId.toString())
    return next(("category not found", { cause: 404 }));
  if (brand.subCategoryId.toString() !== subCategoryId.toString())
    return next(("sub-category not found", { cause: 404 }));

  if (
    brand.addedBy.toString() !== addedBy.toString() &&
    req.authUser.role !== systemRoles.SUPER_ADMIN
  ) {
    return next(("Unauthorized", { cause: 404 }));
  }

  //generate the slug
  const slug = slugify(title, { lower: true, replacement: "-" });

  const appliedPrice = basePrice - (basePrice * (discount || 0)) / 100;

  //    4- upload image to cloudinary
  if (req.files?.length === 0) {
    return next(new Error("image is required", { cause: 400 }));
  }
  let images = [];
  let folderId = generateUniqueString(4);
  const folder = brand.image.public_id.split(`${brand.folderId}/`)[0];
  for (const file of req.files) {
    //https://res.cloudinary.com/dhufjaf84/image/upload/v1711059828/ecommerce-project/categories/mrt4/sub-categories/5xf3/brands/az2y/b2efitmm6n8tptv11bsk.png
    // console.log(folder);
    // console.log(folder + `${brand.folderId}` + `/products/${folderId}`);
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(file.path, {
        folder: folder + `${brand.folderId}` + `/products/${folderId}`,
      });
    images.push({ secure_url, public_id });
  }
  req.folder = folder + `${brand.folderId}` + `/${folderId}`;
  //   console.log(specs);
  const product = {
    title,
    slug,
    desc,
    stock,
    basePrice,
    discount,
    appliedPrice,
    specs: JSON.parse(specs),
    images,
    brandId,
    categoryId,
    subCategoryId,
    addedBy,
    folderId,
  };
  const newProduct = await Product.create(product);
  req.savedDocument = { model: Product, _id: newProduct._id };
  return res
    .status(201)
    .json({ sucess: true, message: "product created", data: newProduct });
};

//=============================================update product controller=============================================

export const updateProduct = async (req, res, next) => {
  const { _id } = req.authUser;
  const { productId } = req.params;
  const { title, desc, stock, basePrice, discount, specs, oldPublicId } =
    req.body;

  //product check
  const product = await Product.findById(productId);
  if (!product) return next(new Error("product not found", { cause: 404 }));

  //   authorization check
  if (
    req.authUser.role !== systemRoles.SUPER_ADMIN &&
    product.addedBy.toString() !== _id.toString()
  ) {
    return next(("Unauthorized", { cause: 404 }));
  }

  if (title) product.title = title;
  const slug = slugify(title, { lower: true, replacement: "-" });
  product.slug = slug;
  if (desc) product.desc = desc;
  if (stock) product.stock = stock;
  if (specs) product.specs = JSON.parse(specs);

  //pricesCheck
  const appliedPrice =
    (basePrice || product.basePrice) *
    (1 - (discount || product.discount) / 100);

  if (basePrice) product.basePrice = basePrice;
  if (discount) product.discount = discount;

  //images
  if (oldPublicId) {
    if (!req.file) {
      return next(new Error("image is required", { cause: 400 }));
    }
    const newPublicId = oldPublicId.split(`${product.folderId}/`)[1];
    const { secure_url } = await cloudinaryConnection().uploader.upload(
      req.file.path,
      {
        folder: `${oldPublicId.split(`${product.folderId}/`)[0]}${
          product.folderId
        }`,
        public_id: newPublicId,
      }
    );

    product.images.map((img) => {
      if (img.public_id === oldPublicId) img.secure_url = secure_url;
    });
  }
  const updatedProduct = await product.save();
  req.savedDocument = { model: Product, _id: updatedProduct._id };
  return res
    .status(200)
    .json({ sucess: true, message: "product updated", data: updatedProduct });
};

//=============================================get all products controller=============================================

export const getAllProducts = async (req, res, next) => {
  const { page, size, sort, ...search } = req.query;
  // console.log(search);
  const features = new ApiFeatures(req.query, Product.find())
    .pagination({ page, size })
    .sort(sort)
    .search(search)
    .filter(search);

  const products = await features.mongooseQuery;

  return res.status(200).json({
    sucess: true,
    message: "products fetched successfully",
    data: products,
  });
};
