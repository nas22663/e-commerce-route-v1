import slugify from "slugify";
import Category from "../../../DB/models/category.model.js";
import SubCategory from "../../../DB/models/sub-category.model.js";
import Brand from "../../../DB/models/brand.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";

export const addsubCategory = async (req, res, next) => {
  //1- deconstruct data from req.body
  const { name } = req.body;
  const { categoryId } = req.params;
  const { _id } = req.authUser;

  //2- check if the category name exist
  const isNameExist = await SubCategory.findOne({ name });
  if (isNameExist)
    return next(new Error("sub-category name already exist", { cause: 409 }));

  //2.5 check if category id exist
  const isCategoryIdExist = await Category.findById(categoryId);
  if (!isCategoryIdExist)
    return next(new Error("category id not found", { cause: 404 }));

  //3- generate the slug
  const slug = slugify(name, "-");

  //    4- upload image to cloudinary
  if (!req.file) {
    return next(new Error("image is required", { cause: 400 }));
  }

  let folderId = generateUniqueString(4);
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/categories/${isCategoryIdExist.folderId}/sub-categories/${folderId}`,
    });

  //5- generate the category object
  const subCategory = {
    name,
    slug,
    image: {
      secure_url,
      public_id,
    },
    folderId,
    addedBy: _id,
    categoryId,
  };

  const newSubCategory = await SubCategory.create(subCategory);
  return res.status(201).json({
    sucess: true,
    message: "sub-category created",
    data: newSubCategory,
  });
};

// ===========================================update sub-category======================================================
export const updateSubCategory = async (req, res, next) => {
  //1- deconstruct data from req.body
  const { name, oldPublicId } = req.body;

  //2- deconstruct data from req.params
  const { subCategoryId } = req.params;

  //3- deconstruct _id from req.authUser
  const { _id } = req.authUser;

  //4-check if the category name valid by using categoryId

  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory)
    return next(new Error("sub-category not found", { cause: 404 }));

  const category = await Category.findById(subCategory.categoryId);
  if (!category) return next(new Error("category not found", { cause: 404 }));

  //5- check if the category name exist
  const isNameExist = await SubCategory.findOne({ name });
  if (isNameExist)
    return next(new Error("sub-category name already exist", { cause: 409 }));

  //6- generate the slug
  const slug = slugify(name, "-");

  subCategory.name = name;
  subCategory.slug = slug;

  subCategory.updatedBy = _id;

  await subCategory.save();

  //    7- upload image to cloudinary
  if (!req.file) {
    return next(new Error("image is required", { cause: 400 }));
  }

  const newPublicId = oldPublicId.split(`${subCategory.folderId}/`)[1];
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      public_id: newPublicId,
      folder: `${process.env.MAIN_FOLDER}/categories/${category.folderId}/sub-categories/${subCategory.folderId}`,
    });

  subCategory.image.secure_url = secure_url;
  await subCategory.save();

  subCategory.updatedBy = _id;
  return res
    .status(200)
    .json({ sucess: true, message: "sub-category updated", data: subCategory });
};

//============================================delete sub-category controller==============================================
export const deleteSubCategory = async (req, res, next) => {
  const { subCategoryId } = req.params;

  //find sub-category
  const subCategory = await SubCategory.findById(subCategoryId).populate(
    "categoryId",
    "folderId"
  );

  // console.log({ subcategoryId: subCategory.categoryId.folderId });
  if (!subCategory)
    return next(new Error("sub-category not found", { cause: 404 }));

  const deletesubCategory = await SubCategory.findByIdAndDelete(subCategoryId);
  if (!deletesubCategory)
    return next(new Error("sub-category not found", { cause: 404 }));

  //find related brands
  const brands = await Brand.deleteMany({ subCategoryId });
  if (brands.deletedCount < 1) console.log("There is no related brands");

  //delete couldinary image

  console.log(subCategory.categoryId.folderId);
  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/categories/${subCategory.categoryId.folderId}/sub-categories/${subCategory.folderId}`
  );

  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/categories/${subCategory.categoryId.folderId}/sub-categories/${subCategory.folderId}`
  );

  return res
    .status(200)
    .json({ sucess: true, message: "sub-category deleted", data: subCategory });
};

//==========================================get all sub-categories======================================================
export const getAllSubCategories = async (req, res, next) => {
  const subCategories = await SubCategory.find().populate([
    {
      path: "brands",
    },
    {
      path: "categoryId",
      select: "name",
    },
  ]);
  return res
    .status(200)
    .json({ sucess: true, message: "all sub-categories", data: subCategories });
};
