import React from 'react';
import Image from 'next/image';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
const prisma = new PrismaClient();

async function page() {
  const images = await prisma.image.findMany({});
  return (
    <div className="p-4 m-auto">
      {/* <Image
        src="https://issue-local.s3.ap-south-1.amazonaws.com/4b4424d4-2b08-49c4-bdce-bbb46cc922a1-blade-runner-2049-4k-wallpapers-part-2-v0-oszc05ryo7xa1.jpg"
        alt="Next.js Logo"
        width={200}
        height={200}
      /> */}

      <Link href={'/'}>Home</Link>
      <div className="p-4 m-auto flex space-x-2">
        {images.map((image) => (
          <div key={image.id} className="p-4 bg-gray-200 ">
            <Image
              src={`https://issue-local.s3.ap-south-1.amazonaws.com/${image.url}`}
              alt="Next.js Logo"
              width={400}
              height={400}
            />

            <h2>{image.title}</h2>
            <h4>{image.description}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}

export default page;
