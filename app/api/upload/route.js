import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Extract the filename from the query parameters
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Add CORS headers to the response
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*'); // Change '*' to your specific domain if needed
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle the file upload
    const blob = await put(filename, request.body, {
      access: 'public',
    });

    // Return the URL of the uploaded file
    return NextResponse.json(blob, { headers });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}

// Optional: Add OPTIONS method handler to handle preflight CORS requests
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*', // Adjust this to match your frontend origin
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
