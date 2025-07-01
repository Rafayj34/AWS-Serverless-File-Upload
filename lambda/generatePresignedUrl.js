import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const handler = async (event) => {
  const { fileName, fileType, userId = "test-user" } = event;

  if (!fileName || !fileType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing fileName or fileType" }),
    };
  }

  const key = `images/${userId}/${fileName}`;
  const s3 = new S3Client({ region: "us-east-1" });

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET,
    Key: key,
    ContentType: fileType,
    
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: signedUrl, key }),
    };
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate upload URL" }),
    };
  }
};
