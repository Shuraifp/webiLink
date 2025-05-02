// import { NextResponse } from "next/server";
// import { v2 as cloudinary } from "cloudinary";
// import formidable from "formidable";
// import fs from "fs/promises";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function POST(request: Request) {
//   const formData = await request.formData();
//   const file = formData.get("image") as File;

//   if (!file) {
//     return NextResponse.json({ error: "No image file provided" }, { status: 400 });
//   }

//   // Validate file type and size
//   if (!["image/jpeg", "image/png"].includes(file.type)) {
//     return NextResponse.json({ error: "Only JPEG and PNG images are supported" }, { status: 400 });
//   }
//   if (file.size > 5 * 1024 * 1024) {
//     return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
//   }

//   try {
//     // Convert File to Buffer
//     const buffer = Buffer.from(await file.arrayBuffer());
//     const filePath = `/tmp/${file.name}`;
//     await fs.writeFile(filePath, buffer);

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder: "polls",
//       allowed_formats: ["jpg", "png"],
//       transformation: [{ width: 512, height: 512, crop: "limit" }],
//     });

//     // Clean up temporary file
//     await fs.unlink(filePath);

//     return NextResponse.json({ url: result.secure_url });
//   } catch (error) {
//     console.error("Upload error:", error);
//     return NextResponse.json({ error: "Upload failed" }, { status: 500 });
//   }
// }