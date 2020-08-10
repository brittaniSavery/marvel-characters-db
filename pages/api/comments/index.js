import nc from "next-connect";
import database from "../../../lib/database";
import next from "next";

const handler = nc().use(database);

/**
 * Creates a new comment
 */
handler.post(async (req, res) => {
  try {
    let comment = req.body;
    comment.modifiedDate = new Date().toISOString();

    const dbo = req.db.collection("comments");
    await dbo.insertOne(comment);

    res.status(201);
    res.send("Comment added!");
  } catch (error) {
    next(Error(error));
  }
});

export default handler;
