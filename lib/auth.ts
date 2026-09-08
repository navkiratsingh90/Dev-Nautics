import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function getUserIdFromRequest(req: NextRequest) {
  try {
    const token =
      req.cookies.get("token")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: string };

    return decoded.userId;
  } catch (error) {
    console.error("getUserIdFromRequest:", error);
    return null;
  }
}