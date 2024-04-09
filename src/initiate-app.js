import db_connection from "../DB/connection.js";
import * as routers from "./modules/index.routes.js";
import { globalResponse } from "./middlewares/global-response.middleware.js";
import { rollbackUploadedFiles } from "./middlewares/rollback-uploaded-files.middleware.js";
import { rollbackSavedDocuments } from "./middlewares/rollback-saved-documents.middlewares.js";
import { scheduleJob } from "node-schedule";
import { cronToChangeExpiredCoupon } from "./utils/cron.js";

export const initiateApp = (app, express) => {
  const port = process.env.PORT;

  app.use(express.json());

  db_connection();

  app.use("/user", routers.userRoutes);
  app.use("/auth", routers.authRoutes);
  app.use("/category", routers.categoryRoutes);
  app.use("/sub-category", routers.subCategoryRoutes);
  app.use("/brand", routers.brandRoutes);
  app.use("/product", routers.productRoutes);
  app.use("/cart", routers.cartRoutes);
  app.use("/coupon", routers.couponRoutes);
  app.use("/order", routers.orderRoutes);

  app.use(globalResponse, rollbackUploadedFiles, rollbackSavedDocuments);

  cronToChangeExpiredCoupon();

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};
