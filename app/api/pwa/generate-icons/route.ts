/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Tamaños de íconos necesarios para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ninguna imagen' },
        { status: 400 }
      );
    }

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Objeto para almacenar todas las imágenes generadas
    const generatedImages: any[] = [];

    // Generar cada tamaño
    for (const size of sizes) {
      const imageBuffer = await sharp(buffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toBuffer();

      generatedImages.push({
        name: `icon-${size}x${size}.png`,
        data: imageBuffer.toString('base64'),
        size: size,
        type: 'icon',
      });
    }

    // Generar favicon.ico (32x32)
    const faviconBuffer = await sharp(buffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();

    generatedImages.push({
      name: 'favicon.ico',
      data: faviconBuffer.toString('base64'),
      size: 32,
      type: 'favicon',
    });

    // Generar apple-touch-icon.png (180x180)
    const appleTouchBuffer = await sharp(buffer)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();

    generatedImages.push({
      name: 'apple-touch-icon.png',
      data: appleTouchBuffer.toString('base64'),
      size: 180,
      type: 'apple',
    });

    return NextResponse.json({
      success: true,
      images: generatedImages,
    });
  } catch (error: any) {
    console.error('Error al generar íconos:', error);
    return NextResponse.json(
      { error: 'Error al procesar la imagen: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'PWA Icon Generator API',
    sizes: sizes,
    additionalIcons: ['favicon.ico (32x32)', 'apple-touch-icon.png (180x180)'],
  });
}
