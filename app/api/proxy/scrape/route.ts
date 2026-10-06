import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Proxying request to localhost:3001', body.rfc);

    const backendResponse = await fetch('http://localhost:3001/api/scrape/sat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.error || 'Error en el backend' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error in proxy route:', error);
    return NextResponse.json(
      { error: 'Error de conexión con el backend de extracción.' },
      { status: 500 }
    );
  }
}
