import { Connection } from "mongoose";

declare global {
  var connection: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

export {};