import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if credentials are available
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Check if we're on Vercel (always use Cloudinary on Vercel)
    const isVercel = !!process.env.VERCEL;
    
    // Check if Cloudinary is configured
    const hasCloudinary = !!(
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET
    );

    // On Vercel, we MUST use Cloudinary (filesystem is read-only)
    if (isVercel && !hasCloudinary) {
      return NextResponse.json({ 
        error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
      }, { status: 500 });
    }

    if (hasCloudinary || isVercel) {
      // Use Cloudinary for production
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Convert buffer to base64 data URI
        const base64 = buffer.toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            dataUri,
            {
              folder: 'rift-events',
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        }) as any;

        return NextResponse.json({ 
          success: true, 
          imageUrl: result.secure_url || result.url 
        });
      } catch (cloudinaryError: any) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return NextResponse.json({ 
          error: 'Failed to upload image to Cloudinary',
          details: cloudinaryError.message 
        }, { status: 500 });
      }
    }

    // Use filesystem for local development only
    try {
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const filename = `${timestamp}-${randomString}.${fileExtension}`;
      const filepath = join(uploadsDir, filename);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Return the public URL
      const imageUrl = `/uploads/${filename}`;

      return NextResponse.json({ success: true, imageUrl });
    } catch (fsError: any) {
      console.error('Filesystem upload error:', fsError);
      return NextResponse.json({ 
        error: 'Failed to upload image to filesystem',
        details: fsError.message 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload image',
      details: error.message 
    }, { status: 500 });
  }
}
