// Simple script to test if environment variables are loading correctly
require('dotenv').config({ path: '.env.local' });

console.log('Testing Vimeo environment variables:');
console.log('VIMEO_ACCESS_TOKEN:', process.env.VIMEO_ACCESS_TOKEN ? 'Set (length: ' + process.env.VIMEO_ACCESS_TOKEN.length + ')' : 'Missing');
console.log('VIMEO_CLIENT_ID:', process.env.VIMEO_CLIENT_ID ? 'Set (length: ' + process.env.VIMEO_CLIENT_ID.length + ')' : 'Missing');
console.log('VIMEO_CLIENT_SECRET:', process.env.VIMEO_CLIENT_SECRET ? 'Set (length: ' + process.env.VIMEO_CLIENT_SECRET.length + ')' : 'Missing');
