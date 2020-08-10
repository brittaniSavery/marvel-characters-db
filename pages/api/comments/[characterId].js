import nc from "next-connect";
import database from "../../../lib/database";

const handler = nc().use(database);

/**
 * Gets all the comments for a specific character
 */
handler.get(async (req, res) => {
  const cId = parseInt(req.query.characterId, 10);
  const comments = await req.db
    .collection("comments")
    .find({ characterId: cId })
    .sort({ modifiedDate: -1 })
    .toArray();

  res.json(comments);
});

export default handler;
