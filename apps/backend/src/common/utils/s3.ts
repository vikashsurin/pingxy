import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: "http://storage:9000", // Your MinIO/Garage URL
  region: "us-east-1",
  forcePathStyle: true, // Required for self-hosted S3
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER!,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD!,
  },
});

export const uploadToStorage = async (file: File) => {
  const fileKey = `uploads/${Bun.randomUUIDv7()}-${file.name}`;

  const parallelUploads3 = new Upload({
    client: s3Client,
    params: {
      Bucket: "pingxy",
      Key: fileKey,
      Body: file.stream(), // Streams data directly to storage
      ContentType: file.type,
    },
  });

  await parallelUploads3.done();

  return {
    // Construct the public URL
    url: `${process.env.STORAGE_PUBLIC_ENDPOINT}/pingxy/${fileKey}`,
    key: fileKey,
  };
};

// Add this to your s3 utility file
export const deleteFromStorage = async (key: string) => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: "pingxy",
      Key: key,
    }),
  );
};

export const initStorage = async () => {
  const bucketName = "pingxy";

  try {
    // 1. Check if bucket exists
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`✅ Bucket "${bucketName}" already exists.`);
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      // 2. Create the bucket if it doesn't exist
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`🚀 Created bucket "${bucketName}"`);

      // 3. Define the Public Read Policy
      const readOnlyUserPolicy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicRead",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };

      // 4. Apply the policy
      await s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: bucketName,
          Policy: JSON.stringify(readOnlyUserPolicy),
        }),
      );
      console.log(`🔓 Public read access enabled for "${bucketName}"`);
    } else {
      console.error("❌ Error initializing storage:", error);
    }
  }
};
