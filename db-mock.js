// This is a mock file used as an alias for mongoose/mongodb in client bundles
// It prevents Edge Runtime errors by providing empty implementations

// Mock mongoose exports
module.exports = {
  connect: () => Promise.resolve(),
  connection: { 
    on: () => {},
    once: () => {}
  },
  Schema: function() { 
    return { 
      methods: {},
      statics: {} 
    }; 
  },
  model: () => ({
    findOne: () => Promise.resolve(null),
    find: () => ({ exec: () => Promise.resolve([]) }),
    create: () => Promise.resolve({})
  }),
  // Other mongoose exports that might be used
  Types: {
    ObjectId: (id) => id
  },
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
