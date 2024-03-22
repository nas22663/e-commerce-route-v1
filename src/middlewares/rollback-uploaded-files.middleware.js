import cloudinaryConnection from "../utils/cloudinary.js";

export const rollbackUploadedFiles = async (req, res, next) => {
  if (req.folder) {
    console.log("rollback");
    await cloudinaryConnection().api.delete_resources_by_prefix(
      `${process.env.MAIN_FOLDER}/${req.folder}`
    );

    await cloudinaryConnection().api.delete_folder(
      `${process.env.MAIN_FOLDER}/${req.folder}`
    );
  }

  next();
};
