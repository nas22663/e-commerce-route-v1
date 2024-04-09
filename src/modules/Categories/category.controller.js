import slugify from "slugify";
import Category from "../../../DB/models/category.model.js";
import SubCategory from "../../../DB/models/sub-category.model.js";
import Brand from "../../../DB/models/brand.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";

//=============================================add category controller=============================================

export const addCategory = async (req, res, next) => {
  //1- deconstruct data from req.body
  const { name } = req.body;
  const { _id } = req.authUser;

  //2- check if the category name exist
  const isNameExist = await Category.findOne({ name });
  if (isNameExist)
    return next(new Error("category name already exist", { cause: 409 }));

  //3- generate the slug
  const slug = slugify(name, "-");

  //    4- upload image to cloudinary
  if (!req.file) {
    return next(new Error("image is required", { cause: 400 }));
  }

  let folderId = generateUniqueString(4);
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/categories/${folderId}`,
    });

  req.folder = `${process.env.MAIN_FOLDER}/categories/${folderId}`;

  //5- generate the category object
  const category = {
    name,
    slug,
    image: {
      secure_url,
      public_id,
    },
    folderId,
    addedBy: _id,
  };

  const newCategory = await Category.create(category);
  req.savedDocument = { model: Category, _id: newCategory._id };

  const x = 8;
  x = 9;
  return res
    .status(201)
    .json({ sucess: true, message: "category created", data: newCategory });
};

// ===========================================update category======================================================
export const updateCategory = async (req, res, next) => {
  //1- deconstruct data from req.body
  const { name, oldPublicId } = req.body;

  //2- deconstruct data from req.params
  const { categoryId } = req.params;

  //3- deconstruct _id from req.authUser
  const { _id } = req.authUser;

  //4-check if the category name valid by using categoryId
  const category = await Category.findById(categoryId);
  if (!category) return next(new Error("category not found", { cause: 404 }));

  //5- check if user want to update the name field
  if (name) {
    const isNameExist = await Category.findOne({ name });
    if (name == category.name) {
      return next(
        new Error(
          "please enter different category name from the existing one",
          { cause: 400 }
        )
      );
    }
    if (isNameExist)
      return next(new Error("category name already exist", { cause: 409 }));

    category.name = name;
    category.slug = slugify(name, "-");

    await category.save();
  }

  //6- check if user want to update the image
  if (oldPublicId) {
    if (!req.file)
      return next({
        message: "image is required",
        cause: 400,
      });
    const newPublicId = oldPublicId.split(`${category.folderId}/`)[1];
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/categories/${category.folderId}`,
        public_id: newPublicId,
      });
    category.image.secure_url = secure_url;
    await category.save();
  }

  // 7- set value for the updatedBy field
  category.updatedBy = _id;
  await category.save();
  return res
    .status(200)
    .json({ sucess: true, message: "category updated", data: category });
};

//==========================================get all categories======================================================

export const getAllCategories = async (req, res, next) => {
  const categories = await Category.find().populate([
    {
      path: "subCategories",
      populate: {
        path: "brands",
      },
    },
  ]);
  return res
    .status(200)
    .json({ sucess: true, message: "all categories", data: categories });
};

//==========================================delete category======================================================
export const deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) return next({ message: "category not found", cause: 404 });
  // delete related subcategories
  const subCategories = await SubCategory.deleteMany({ categoryId });
  if (subCategories.deletedCount < 1)
    console.log("There is no related sub-categories");

  // delete related brands
  const brands = await Brand.deleteMany({ categoryId });
  if (brands.deletedCount < 1) {
    console.log("There is no related brands");
  }

  //delete cloudinary image

  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/categories/${category.folderId}`
  );
  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/categories/${category.folderId}`
  );

  return res
    .status(200)
    .json({ sucess: true, message: "category deleted", data: category });
};
