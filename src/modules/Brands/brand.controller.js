import slugify from "slugify";
import Brand from "../../../DB/models/brand.model.js";
import SubCategory from "../../../DB/models/sub-category.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";

export const addBrand = async (req, res, next) => {
  // 1- Deconstruct data from req
  const { name } = req.body;
  const { _id } = req.authUser;
  const { subCategoryId, categoryId } = req.query;

  // 2- Check if the sub-category exists
  const subCategory = await SubCategory.findById(subCategoryId).populate(
    "categoryId",
    "folderId"
  );
  if (!subCategory) {
    return res
      .status(404)
      .json({ success: false, message: "Sub-category not found" });
  }

  // Check if the brand name exists in the same subcategory
  const isBrandExist = await Brand.findOne({ name, subCategoryId });
  if (isBrandExist) {
    return res
      .status(409)
      .json({ success: false, message: "Brand name already exists" });
  }

  // Check if categoryId matches subCategory's categoryId
  if (categoryId !== subCategory.categoryId._id.toString()) {
    return res
      .status(409)
      .json({ success: false, message: "Category ID does not match" });
  }

  // 3- Generate the slug
  const slug = slugify(name, "-");

  // 4- Upload image to cloudinary
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Image is required" });
  }

  let folderId = generateUniqueString(4);
  let imageUploadResult;
  try {
    imageUploadResult = await cloudinaryConnection().uploader.upload(
      req.file.path,
      {
        folder: `${process.env.MAIN_FOLDER}/categories/${subCategory.categoryId.folderId}/sub-categories/${subCategory.folderId}/brands/${folderId}`,
      }
    );
  } catch (error) {
    // Handle the case where the image upload fails
    console.error("Cloudinary upload failed:", error);
    // Assigning a placeholder; in a real scenario, you might handle this differently
    imageUploadResult = {
      secure_url: "/path/to/default/image.png",
      public_id: `failed_upload_${Date.now()}`,
    };
  }

  // 5- Generate the brand object
  const brand = new Brand({
    name,
    slug,
    image: {
      secure_url: imageUploadResult.secure_url,
      public_id: imageUploadResult.public_id,
    },
    folderId,
    addedBy: _id,
    subCategoryId,
    categoryId,
  });

  const newBrand = await brand.save();
  return res.status(201).json({
    success: true,
    message: "Brand created successfully",
    data: newBrand,
  });
};

// ============================================delete brand======================================================
export const deleteBrand = async (req, res, next) => {
  //1- deconstruct data from req.params
  const { brandId } = req.params;
  const { _id } = req.authUser;

  const brand = await Brand.findById(brandId)
    .populate("subCategoryId")
    .populate("categoryId");

  if (!brand) return next(new Error("Brand not found", { cause: 404 }));

  // //2- check if the brand added by user (convert both to string for comparison)
  // if (brand.addedBy.toString() !== _id.toString())
  //   return next(new Error("Unauthorized to delete this brand", { cause: 403 }));

  //3- delete brand
  await Brand.findByIdAndDelete(brandId);

  //4- delete image from cloudinary
  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/categories/${brand.categoryId.folderId}/sub-categories/${brand.subCategoryId.folderId}/brands/${brand.folderId}`
  );

  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/categories/${brand.categoryId.folderId}/sub-categories/${brand.subCategoryId.folderId}/brands/${brand.folderId}`
  );

  return res.status(200).json({
    success: true,
    message: "Brand deleted successfully",
  });
};

//============================================update brand controller=============================================
export const updateBrand = async (req, res, next) => {
  //1- deconstruct data from req.body
  const { name, oldPublicId } = req.body;
  const { brandId } = req.params;
  const { _id } = req.authUser;

  //2- check if the brand name valid by using brandId
  const brand = await Brand.findById(brandId).populate({
    path: "subCategoryId", // Populate the subcategory
    populate: {
      path: "categoryId", // Within that subcategory, also populate the category
      model: "Category", // Explicitly specify the model if Mongoose can't infer it
    },
  });

  if (!brand) return next(new Error("brand not found", { cause: 404 }));
  if (brand.addedBy.toString() !== _id.toString())
    return next(new Error("Unauthorized to update this brand", { cause: 403 }));

  //3- check if the brand name exist
  const isNameExist = await Brand.findOne({ name });
  if (isNameExist)
    return next(new Error("brand name already exist", { cause: 409 }));

  //4- update the slug
  const slug = slugify(name, "-");
  brand.name = name;
  brand.slug = slug;
  await brand.save();

  //5- upload image to cloudinary
  if (!req.file) {
    return next(new Error("image is required", { cause: 400 }));
  }
  console.log(brand.subCategoryId.categoryId.folderId);

  const newPublicId = oldPublicId.split(`${brand.folderId}/`)[1];
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      public_id: newPublicId,
      folder: `${process.env.MAIN_FOLDER}/categories/${brand.subCategoryId.categoryId.folderId}/sub-categories/${brand.subCategoryId.folderId}/brands/${brand.folderId}`,
    });
  brand.image = {
    secure_url,
    public_id,
  };
  await brand.save();
  return res.status(200).json({
    success: true,
    message: "brand updated successfully",
  });
};

//============================================get all brands controller=============================================
export const getAllBrands = async (req, res, next) => {
  const brands = await Brand.find().populate([
    {
      path: "subCategoryId",
      select: "name",
      populate: {
        path: "categoryId",
        select: "name",
      },
    },
  ]);
  return res.status(200).json({
    sucess: true,
    message: "brands fetched successfully",
    data: brands,
  });
};
