import Category from "../../../DB/models/category.model.js";
import slugify from "slugify";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";
import SubCategory from "../../../DB/models/sub-category.model.js";

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
