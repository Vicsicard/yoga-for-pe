// Check if running in Edge Runtime
export function isEdgeRuntime() {
  return typeof process !== 'undefined' && 
    process.env.NEXT_RUNTIME === 'edge';
}

// Check if running in Node.js environment
export function isNodeEnvironment() {
  return typeof process !== 'undefined' && 
    process.versions != null && 
    process.versions.node != null &&
    !process.env.NEXT_RUNTIME;
}
