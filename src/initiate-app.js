import db_connection from "../DB/connection.js";
import * as routers from "./modules/index.routes.js";
import { globalResponse } from "./middlewares/global-response.middleware.js";
import { rollbackUploadedFiles } from "./middlewares/rollback-uploaded-files.middleware.js";

export const initiateApp = (app, express) => {
  const port = process.env.PORT;

  app.use(express.json());

  db_connection();

  app.use("/user", routers.userRoutes);
  app.use("/auth", routers.authRoutes);
  app.use("/category", routers.categoryRoutes);
  app.use("/sub-category", routers.subCategoryRoutes);
  app.use("/brand", routers.brandRoutes);

  app.use(globalResponse, rollbackUploadedFiles);

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};
