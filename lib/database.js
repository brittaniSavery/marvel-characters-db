import nc from "next-connect";
import { MongoClient } from "mongodb";

const uri = `${process.env.DATABASE_URL}/marvel-db?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function databaseMiddleware(req, res, next) {
  if (!client.isConnected()) await client.connect();
  req.dbClient = client;
  req.db = client.db("marvel-db");
  return next();
}

const middleware = nc();
middleware.use(databaseMiddleware);

export default middleware;
