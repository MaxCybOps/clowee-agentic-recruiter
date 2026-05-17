import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');
    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    if (process.env.MOCK_MODE === 'true') {
      return new NextResponse(new ArrayBuffer(0), {
        headers: { 'Content-Type': 'audio/mpeg' },
      });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const actualVoiceId = process.env.ELEVENLABS_VOICE_ID || 'piTKPmq9n4TpoDPs348P';

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${actualVoiceId}/stream?optimize_streaming_latency=2`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey as string,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.85,
            use_speaker_boost: true
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs detailed error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    // Stream response directly to client to eliminate buffering lag
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Voice Error:', error);
    return NextResponse.json({ error: 'Failed to generate voice' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (process.env.MOCK_MODE === 'true') {
      return new NextResponse(new ArrayBuffer(0), {
        headers: { 'Content-Type': 'audio/mpeg' },
      });
    }

    const { text, voiceId } = await req.json();

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const actualVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || 'piTKPmq9n4TpoDPs348P';

    console.log('Voice Request (POST):', { actualVoiceId, keyLength: apiKey?.length });

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${actualVoiceId}/stream?optimize_streaming_latency=2`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey as string,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.85,
            use_speaker_boost: true
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs detailed error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Voice Error:', error);
    return NextResponse.json({ error: 'Failed to generate voice' }, { status: 500 });
  }
}
