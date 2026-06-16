import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 1. Meta verification challenge
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');

  // 2. environment variable
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Verification failed', { status: 403 });
}

export async function POST(request: NextRequest) {
  // 3. log the incoming replies and return 200
  const body = await request.json();
  console.log('Incoming WhatsApp message:', JSON.stringify(body, null, 2));

  return NextResponse.json({ status: 'received' });
}
