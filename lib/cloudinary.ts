import { v2 as cloudinary } from "cloudinary";
import { Upload } from "lucide-react";

cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file: Blob): Promise<string | null> => {
   if (!file) {
      return null;
   }
   try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return new Promise((resolve, reject) => {
         const upload = cloudinary.uploader.upload_stream(
            {
               resource_type: "auto",
            },
            (error, result) => {
               if (error) {
                  reject(error);
               } else {
                  resolve(result?.secure_url ?? null);
               }
            }
         );
         upload.end(buffer);
      });
   } catch (error) {
      console.error(error);
      return null;
   }
};

export default uploadToCloudinary;
