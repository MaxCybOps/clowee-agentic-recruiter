import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    if (process.env.MOCK_MODE === 'true') {
      return new NextResponse(new ArrayBuffer(0), {
        headers: { 'Content-Type': 'audio/mpeg' },
      });
    }

    const { text, voiceId } = await req.json();

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const actualVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || '21mOQcygkY7TYh8jt7oo';

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${actualVoiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey as string,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs detailed error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: any) {
    console.error('Voice Error:', error);
    return NextResponse.json({ error: 'Failed to generate voice' }, { status: 500 });
  }
}
