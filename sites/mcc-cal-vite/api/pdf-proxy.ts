// Edge Function for PDF processing and optimization
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const pdfUrl = url.searchParams.get('url');

  if (!pdfUrl) {
    return new Response('Missing PDF URL parameter', { status: 400 });
  }

  try {
    // Fetch the PDF from the original source
    const pdfResponse = await fetch(pdfUrl);
    
    if (!pdfResponse.ok) {
      return new Response('Failed to fetch PDF', { status: pdfResponse.status });
    }

    // Get PDF data
    const pdfData = await pdfResponse.arrayBuffer();

    // Set appropriate headers for PDF serving
    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': 'inline; filename="thesis.pdf"',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    return new Response(pdfData, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
