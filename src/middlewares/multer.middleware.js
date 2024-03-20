import multer from "multer";
import { allowedExtensions } from "../utils/allowed-extensions.js";

export const multerMiddleHost = ({ extensions = allowedExtensions.image }) => {
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, cb) => {
    if (extensions.includes(file.mimetype.split("/")[1])) {
      cb(null, true);
    } else {
      cb(new Error("image format not allowed"), false);
    }
  };

  const file = multer({ fileFilter, storage });
  return file;
};
