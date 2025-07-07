export const config = {
  // Don't run middleware on API routes or static files
  matcher: ['/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)'],
};

export default function middleware(req) {
  // Empty middleware that doesn't modify requests
  // This is just to set up config for runtime environment
  return;
}
