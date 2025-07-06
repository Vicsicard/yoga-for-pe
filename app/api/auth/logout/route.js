import { logout } from '../../../../lib/controllers/auth.controller';

export async function POST(req) {
  try {
    return await logout({}, { status: (code) => ({ json: (data) => new Response(JSON.stringify(data), { status: code, headers: { 'Content-Type': 'application/json' } }) }) });
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ message: 'Server error', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
