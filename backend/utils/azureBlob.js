import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";
import path from "path";
import mime from "mime-types"; // <== à installer si ce n’est pas déjà fait
dotenv.config();

// 🔵 Conteneur pour les candidatures (PDF, etc.)
const candidaturesContainer = "candidatures";
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const candidaturesClient = blobServiceClient.getContainerClient(candidaturesContainer);

// 🟢 Conteneur pour les images/vidéos des offres
const mediasContainer = "offresmedias";
const mediasClient = blobServiceClient.getContainerClient(mediasContainer);

// ✅ Upload PDF, CV, etc. vers le conteneur "candidatures"
export const uploadToAzure = async (filePath, originalName, prefix = "fichier") => {
  try {
    const extension = path.extname(originalName);
    const cleanName = path.basename(originalName, extension).replace(/\s+/g, "_");
    const timestamp = Date.now();
    const finalName = `${prefix}_${cleanName}_${timestamp}${extension}`;

    const blockBlobClient = candidaturesClient.getBlockBlobClient(finalName);

    await blockBlobClient.uploadFile(filePath, {
      blobHTTPHeaders: { blobContentType: "application/pdf" }
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error("❌ Erreur upload Azure (candidatures) :", error.message);
    throw error;
  }
};

// ✅ Upload images (offres) vers le conteneur "offresmedias"
export const uploadMediaToAzure = async (filePath, originalName, prefix = "media") => {
  try {
    const extension = path.extname(originalName);
    const cleanName = path.basename(originalName, extension).replace(/\s+/g, "_");
    const timestamp = Date.now();
    const finalName = `${prefix}_${cleanName}_${timestamp}${extension}`;

    const contentType = mime.lookup(extension) || "application/octet-stream";

    const blockBlobClient = mediasClient.getBlockBlobClient(finalName);

    await blockBlobClient.uploadFile(filePath, {
      blobHTTPHeaders: { blobContentType: contentType }
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error("❌ Erreur upload Azure (medias) :", error.message);
    throw error;
  }
};
