import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const documentId = params.documentId;

    // Get document from database
    const document = await prisma.orderDocument.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if file exists
    const filePath = document.filePath;
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Return the file with download headers
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', document.mimeType);
    response.headers.set('Content-Disposition', `attachment; filename="${document.fileName}"`);
    
    return response;
  } catch (error) {
    console.error('Error serving document for download:', error);
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 });
  }
}
