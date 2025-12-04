const cloudinary = require("../config/cloudinary");
exports.uploadToCloudinary = async (fileBuffer, resourecType, folder_name) => {
  try {
    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: resourecType, folder: folder_name },
          (error, result) => {
            if (error) return reject(error);
            if (result) return resolve(result);
          }
        )
        .end(fileBuffer);
    });

    const result = await uploadPromise;
    console.log("Image uploaded sucessfully!");
    return result.secure_url;
} catch (error) {
  console.log("image upload failed!", error);
  throw error;  // <-- IMPORTANT
}

};
