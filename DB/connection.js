import mongoose from "mongoose";

const db_connection = async () => {
  await mongoose
    .connect(process.env.CONNECTION_URL_LOCAL)
    .then((res) => {
      console.log("DB Connected");
    })
    .catch((err) => {
      console.log(err);
    });
};

export default db_connection;
