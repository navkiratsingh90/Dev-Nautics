import mongoose from "mongoose";

const mongodbUrl = process.env.MONGODB_URL;

if (!mongodbUrl) {
  throw new Error("MongoDB URL is missing");
}

declare global {
  var Connection: {
    conn: any;
    promise: Promise<any> | null;
  };
}

let cached = global.connection;

if (!cached) {
  cached = global.connection = {
    conn: null,
    promise: null,
  };
}

const connectDb = async () => {

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {

    cached.promise = mongoose
      .connect(mongodbUrl)
      .then((mongooseInstance) => {
        return mongooseInstance.connection;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
};

export default connectDb;