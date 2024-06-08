'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Link from 'next/link';
export default function Home() {
  const { register, handleSubmit } = useForm();
  const [filePreview, setFilePreview] = useState<string | null>(null); // State to store the file preview URL

  // Function to handle form submission
  const onSubmit: any = async (data: FormData) => {
    if (data) {
      const formData = new FormData();
      formData.append('file', data.file[0]);
      formData.append('title', data.title);
      formData.append('description', data.description);

      try {
        // Step 1: Upload form data to your server to get presigned URL
        const res = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (res.data) {
          const { url, fields } = res.data;

          // Create new FormData for S3 upload
          const s3FormData = new FormData();
          Object.entries(fields).forEach(([key, value]) => {
            s3FormData.append(key, value);
          });
          s3FormData.append('file', data.file[0]);

          // Step 2: Upload the file to S3 using the presigned URL
          const s3Response = await axios.post(url, s3FormData);

          console.log('S3 Upload Response:', s3Response.data);
          alert('Upload successful!');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Upload failed.');
      }
    }
  };

  // Function to handle file change and display file preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <Link href={'/images'} className="text-blue-500">
          Go to images
        </Link>
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Upload Image
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              {...register('title')}
              className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter title"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows="4"
              {...register('description')}
              className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter description"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              File
            </label>
            <input
              type="file"
              id="file"
              {...register('file')}
              onChange={handleFileChange} // Call handleFileChange on file input change
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>
          {/* Display file preview if available */}
          {filePreview && (
            <div>
              <Image
                src={filePreview}
                alt="File Preview"
                width={0}
                height={0}
                className="mt-4 w-full max-h-64 object-contain"
              />
            </div>
          )}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
