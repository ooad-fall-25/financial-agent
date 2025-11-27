import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});


export const getPreSignedURL = async (file: File, fileName: string, fileType: string, fileSize: number, userId: string) => {
  const checkSum = await computeSHA256(file);
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType, 
    ContentLength: fileSize,
    ChecksumSHA256: checkSum, 
    Metadata: {
      userId: userId
    }
  });

  const signedURL = await getSignedUrl(s3, putObjectCommand, {expiresIn: 60});
  return signedURL; 
};

const computeSHA256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer); 
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex; 
}