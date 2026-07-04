const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const mockDbPath = path.join(__dirname, 'mockDb.json');

// In-Memory mock storage for when MongoDB is not running
let mockStorage = {
  users: [],
  resumes: [],
  careerprofiles: [],
  roadmaps: [],
  interviews: [],
  progresses: [],
  agentactivities: []
};

const loadMockStorage = () => {
  try {
    if (fs.existsSync(mockDbPath)) {
      const data = fs.readFileSync(mockDbPath, 'utf8');
      const parsed = JSON.parse(data);
      Object.assign(mockStorage, parsed);
    }
  } catch (err) {
    console.error('Failed to load mock storage:', err);
  }
};

const saveMockStorage = () => {
  try {
    fs.writeFileSync(mockDbPath, JSON.stringify(mockStorage, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save mock storage:', err);
  }
};

let useMock = false;

const getCollection = (modelName) => {
  const name = modelName.toLowerCase() + 's';
  if (!mockStorage[name]) mockStorage[name] = [];
  return mockStorage[name];
};

const matchQuery = (item, query) => {
  if (!query) return true;
  for (const key in query) {
    let queryVal = query[key];
    
    // Handle nested ObjectIds/strings
    if (queryVal && queryVal.toString) queryVal = queryVal.toString();
    let itemVal = item[key];
    if (itemVal && itemVal.toString) itemVal = itemVal.toString();

    if (itemVal !== queryVal) return false;
  }
  return true;
};

// Helper to create mock documents with save and standard properties
const createMockDoc = (data, collection, modelName) => {
  const finalId = data._id || data.id || Math.random().toString(36).substring(2, 9);
  const doc = {
    ...data,
    _id: finalId,
    id: finalId,
    save: async function() {
      const idx = collection.findIndex(item => item._id === this._id);
      if (idx !== -1) {
        collection[idx] = this;
      } else {
        collection.push(this);
      }
      saveMockStorage();
      return this;
    },
    select: function() {
      return this;
    }
  };
  return doc;
};

// Immediately patch mongoose.model when this file is loaded.
// This prevents race conditions where models are required before MongoDB timeout fails.
const originalModel = mongoose.model;

mongoose.model = function(name, schema) {
  const model = originalModel.apply(this, arguments);
  const collection = getCollection(name);

  // Keep references to original methods
  const origFindOne = model.findOne;
  const origFindById = model.findById;
  const origFind = model.find;
  const origCreate = model.create;
  const origFindOneAndUpdate = model.findOneAndUpdate;
  const origFindByIdAndUpdate = model.findByIdAndUpdate;

  model.findOne = async function(query) {
    if (useMock) {
      const item = collection.find(x => matchQuery(x, query));
      return item ? createMockDoc(item, collection, name) : null;
    }
    return origFindOne.apply(this, arguments);
  };

  model.findById = async function(id) {
    if (useMock) {
      if (!id) return null;
      const item = collection.find(x => x._id === id.toString());
      return item ? createMockDoc(item, collection, name) : null;
    }
    return origFindById.apply(this, arguments);
  };

  model.find = function(query) {
    if (useMock) {
      const items = collection.filter(x => matchQuery(x, query)).map(x => createMockDoc(x, collection, name));
      
      const chain = {
        sort: function() { return this; },
        limit: function(num) {
          items.splice(num);
          return this;
        },
        then: function(callback) {
          return Promise.resolve(items).then(callback);
        },
        catch: function(errCallback) {
          return Promise.resolve(items).catch(errCallback);
        }
      };
      
      Object.setPrototypeOf(chain, Array.prototype);
      Object.assign(chain, items);
      
      return chain;
    }
    return origFind.apply(this, arguments);
  };

  model.create = async function(data) {
    if (useMock) {
      // If data is an array
      if (Array.isArray(data)) {
        const docs = data.map(item => createMockDoc(item, collection, name));
        collection.push(...docs);
        saveMockStorage();
        return docs;
      }
      const doc = createMockDoc(data, collection, name);
      collection.push(doc);
      saveMockStorage();
      return doc;
    }
    return origCreate.apply(this, arguments);
  };

  model.findOneAndUpdate = async function(query, update, options = {}) {
    if (useMock) {
      let item = collection.find(x => matchQuery(x, query));
      if (!item && options.upsert) {
        item = { _id: Math.random().toString(36).substring(2, 9), ...query };
        collection.push(item);
      }
      if (item) {
        for (const key in update) {
          if (key === '$pull') {
            const pullVal = update[key];
            for (const pKey in pullVal) {
              if (Array.isArray(item[pKey])) {
                item[pKey] = item[pKey].filter(val => val !== pullVal[pKey]);
              }
            }
          } else if (key === '$push') {
            const pushVal = update[key];
            for (const pKey in pushVal) {
              if (!Array.isArray(item[pKey])) item[pKey] = [];
              item[pKey].push(pushVal[pKey]);
            }
          } else if (key === '$inc') {
            const incVal = update[key];
            for (const iKey in incVal) {
              item[iKey] = (item[iKey] || 0) + incVal[iKey];
            }
          } else {
            item[key] = update[key];
          }
        }
        saveMockStorage();
        return createMockDoc(item, collection, name);
      }
      return null;
    }
    return origFindOneAndUpdate.apply(this, arguments);
  };

  model.findByIdAndUpdate = async function(id, update, options = {}) {
    if (useMock) {
      return await model.findOneAndUpdate({ _id: id }, update, options);
    }
    return origFindByIdAndUpdate.apply(this, arguments);
  };

  return model;
};

const connectDB = async () => {
  try {
    // Attempt connecting to database with a short timeout
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillforge', {
      serverSelectionTimeoutMS: 1500 
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    useMock = true;
    loadMockStorage();
    console.log('\n======================================================');
    console.log('⚠️  DATABASE WARNING: Local MongoDB is not running.');
    console.log('💡  SkillForge AI is running in IN-MEMORY DATABASE MODE (Persistent JSON).');
    console.log('✨  All features (auth, roadmaps, interviews) will work!');
    console.log('======================================================\n');
  }
};

module.exports = connectDB;
