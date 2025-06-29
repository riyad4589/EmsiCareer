// utils/cloudinary.js
export const getDownloadUrl = (url) => {
    if (!url || !url.includes("/upload/")) return url;
    return url.replace("/upload/", "/upload/fl_attachment/");
  };