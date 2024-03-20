import { customAlphabet } from "nanoid";

const generateUniqueString = (length) => {
  const nanoid = customAlphabet(
    "1234567890absdefghijklmnopqrstuvwxyz",
    length || 6
  );
  return nanoid();
};

export default generateUniqueString;
