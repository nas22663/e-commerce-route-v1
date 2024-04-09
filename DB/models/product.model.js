import { model } from "mongoose";
import { Schema } from "mongoose";

/**
 * strings
 * numbers
 * objectIds
 * arrays
 */

export const productSchema = new Schema(
  {
    //strings
    title: { type: String, required: true, trim: true },
    desc: String,
    slug: { type: String, required: true },
    folderId: { type: String, required: true },

    //numbers
    basePrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    appliedPrice: { type: Number, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rate: { type: Number, default: 0, min: 0, max: 5 },

    //objectIds
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    //arrays
    images: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true },
      },
    ],
    specs: {
      type: Map,
      of: [String | Number],
    },
  },
  { timestamps: true }
);

export default model("Product", productSchema);
