import { NextResponse } from 'next/server';

type ChatMsg = { role: 'user' | 'assistant' | 'system'; content: string };

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const messages = (body as any)?.messages as ChatMsg[] | undefined;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
      }),
    });

    const isOk = openAiRes.ok;
    const status = openAiRes.status;
    const text = await openAiRes.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!isOk) {
      return NextResponse.json(
        { error: 'OpenAI error', status, detail: json ?? text },
        { status: 502 },
      );
    }

    const content = json?.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message ?? String(e) }, { status: 500 });
  }
}
