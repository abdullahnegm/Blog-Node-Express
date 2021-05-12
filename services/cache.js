const mongoose = require("mongoose");

const util = require("util");

const redis = require("redis");
const { collection } = require("../models/posts");
const client = redis.createClient();
client.hget = util.promisify(client.hget);

mongoose.Query.prototype.cache = function (options = {}) {
  this.useChace = true;
  this.hashKey = JSON.stringify(options.key || "");

  return this;
};

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function () {
  if (!this.useChace) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );
  try {
    const cacheValue = await client.hget(this.hashKey, key);

    if (cacheValue) {
      console.log("From Redis Cache");
      const doc = JSON.parse(cacheValue);
      return Array.isArray(doc)
        ? doc.map((item) => new this.model(item))
        : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);
    client.hset(this.hashKey, key, JSON.stringify(result));

    console.log("From Mongoose");
    return result;
  } catch (e) {
    console.log(e.message);
  }
};
