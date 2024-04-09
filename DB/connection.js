import mongoose from "mongoose";

const db_connection = async () => {
  await mongoose
    .connect(process.env.CONNECTION_URL_HOST)
    .then((res) => {
      console.log("DB Connected");
    })
    .catch((err) => {
      console.log(err);
    });
};

export default db_connection;

// mongodb+srv://nas22663:AWs8GAyVUuYa69GV@cluster0.ciid2yv.mongodb.net/
