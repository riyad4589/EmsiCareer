import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const containerName = "candidatures";
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);

export const uploadToAzure = async (filePath, originalName, prefix = "fichier", mimeType = "") => {
  try {
    const extension = path.extname(originalName); // .pdf, .jpg, .png, etc.
    const cleanName = path.basename(originalName, extension).replace(/\s+/g, "_"); // Sans espaces
    const timestamp = Date.now();

    const finalName = `${prefix}_${cleanName}_${timestamp}${extension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(finalName);

    await blockBlobClient.uploadFile(filePath, {
      blobHTTPHeaders: { blobContentType: mimeType || "application/octet-stream" }
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error("❌ Erreur upload Azure Blob :", error.message);
    throw error;
  }
};
