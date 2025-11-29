import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto"

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});


export const getPutPreSignedURL = async (fileName: string, fileType: string, fileSize: number, userId: string, checkSum: string) => {
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName + "-" + generateRandomName(),
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

const generateRandomName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex"); 