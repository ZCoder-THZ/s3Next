import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { res } from '@/lib/resParser';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const GET = (req: Request) => {
  return res('hello world');
};

export const POST = async (req: Request) => {
  // const formData = await req.formData();
  // const title = formData.get('title');
  // const description = formData.get('description');
  // const file = formData.get('file');
  try {
    const formData = await req.formData();
    const { title, description, file } = Object.fromEntries(formData.entries());

    const client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });

    const fileName = file instanceof File ? file.name : 'No file uploaded';
    const fileExtension =
      file instanceof File ? file.name.split('.').pop() : 'No file uploaded';

    const fileType = file instanceof File ? file.type : 'No file uploaded';

    const key = ` ${uuidv4()}-${fileName}`;

    const storeImage = await prisma.image.create({
      data: {
        title: title as string,
        description: description as string,
        url: key,
      },
    });

    const { url, fields } = await createPresignedPost(client, {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: key, //filename with extension
      Conditions: [
        ['content-length-range', 0, 10485760], // up to 10 MB
      ],
      Fields: {
        acl: 'public-read',
        'Content-Type': fileType,
      },
      Expires: 600, // 10 minutes
    });

    return new Response(JSON.stringify({ url, fields }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {}
};
