// This is a mock file used as an alias for mongoose/mongodb in client bundles
// It prevents Edge Runtime errors by providing empty implementations

// Mock mongoose exports
module.exports = {
  // Mock basic mongoose functionality with empty functions
  connect: () => Promise.resolve(),
  model: () => ({}),
  Schema: function() { return {} },
  connection: {
    on: () => {},
    once: () => {},
  },
  
  // Mock MongoDB functionality
  MongoClient: function() {
    return {
      connect: () => Promise.resolve({
        db: () => ({})
      }),
      close: () => Promise.resolve(),
    };
  },
  
  // Additional mongoose properties that might be referenced
  models: {},
  modelNames: () => [],
  
  // Add any other functions that might be called
  disconnect: () => Promise.resolve(),
  set: () => {},
};
