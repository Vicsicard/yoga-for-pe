import { register } from '../../../../lib/controllers/auth.controller';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    return await register({ body }, { status: (code) => ({ json: (data) => new Response(JSON.stringify(data), { status: code, headers: { 'Content-Type': 'application/json' } }) }) });
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ message: 'Server error', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
