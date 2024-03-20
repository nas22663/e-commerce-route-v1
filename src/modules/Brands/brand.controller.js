import slugify from "slugify";
import Brand from "../../../DB/models/brand.model.js";
import SubCategory from "../../../DB/models/sub-category.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";

export const addBrand = async (req, res, next) => {
  //1- deconstruct data from req
  const { name } = req.body;
  const { _id } = req.authUser;
  const { subCategoryId, categoryId } = req.query;

  //2- check if the brand name exists and same subcategory , category check , subcategory check
  const subCategory = await SubCategory.findById(subCategoryId).populate(
    "categoryId",
    "folderId"
  );

  if (!subCategory)
    return next({
      message: "sub-category not found",
      cause: 404,
    });
  const isBrandExist = await Brand.findOne({ name, subCategoryId });
  if (isBrandExist)
    return next({
      message: "brand name already exist",
      cause: 409,
    });

  if (categoryId != subCategory.categoryId._id)
    return next({
      message: "category id not matched",
      cause: 409,
    });

  //3- generate the slug
  const slug = slugify(name, "-");

  //4- upload image to cloudinary
  if (!req.file) {
    return next(new Error("image is required", { cause: 400 }));
  }

  let folderId = generateUniqueString(4);
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/categories/${subCategory.categoryId.folderId}/sub-categories/${subCategory.folderId}/brands/${folderId}`,
    });

  //5- generate the brand object
  const brand = {
    name,
    slug,
    image: {
      secure_url,
      public_id,
    },
    folderId,
    addedBy: _id,
    subCategoryId,
    categoryId,
  };

  const newBrand = await Brand.create(brand);
  return res.status(201).json({
    sucess: true,
    message: "brand created",
    data: newBrand,
  });
};
