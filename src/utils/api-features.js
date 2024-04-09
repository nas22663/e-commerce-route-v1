import { paginationFunction } from "../utils/pagination.js";

export class ApiFeatures {
  constructor(query, mongooseQuery) {
    this.query = query;
    this.mongooseQuery = mongooseQuery;
  }

  pagination() {
    const { page, size } = this.query;
    const { limit, skip } = paginationFunction({ page, size });
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }

  sort(sortBy) {
    if (!sortBy) {
      this.mongooseQuery = this.mongooseQuery.sort({ createdAt: -1 });
      return this;
    }
    const formula = sortBy
      .replace(/desc/g, -1)
      .replace(/asc/g, 1)
      .replace(/ /g, ":");
    const [key, value] = formula.split(":");
    this.mongooseQuery = this.mongooseQuery.sort({ [key]: +value });
    return this;
  }

  search(search) {
    const queryFilter = {};

    if (search.title)
      queryFilter.title = { $regex: search.title, $options: "i" };
    if (search.desc) queryFilter.desc = { $regex: search.desc, $options: "i" };
    if (search.discount) queryFilter.discount = { $ne: 0 };
    if (search.priceFrom && !search.priceTo)
      queryFilter.appliedPrice = { $gte: search.priceFrom };
    if (!search.priceFrom && search.priceTo)
      queryFilter.appliedPrice = { $lte: search.priceTo };
    if (search.priceFrom && search.priceTo)
      queryFilter.appliedPrice = {
        $gte: search.priceFrom,
        $lte: search.priceTo,
      };

    this.mongooseQuery = this.mongooseQuery.find(queryFilter);
    return this;
  }

  filter(filters) {
    const queryFilter = JSON.stringify(filters).replace(
      /gt|lt|gte|lte|regex/g,
      (match) => `$${match}`
    );

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryFilter));
    return this;
  }
}
