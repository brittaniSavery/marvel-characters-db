import React from "react";
import useSWR, { mutate } from "swr";
import PageLoader from "./PageLoader";

export default function Comments({ characterId }) {
  const [name, setName] = React.useState();
  const [message, setMessage] = React.useState();

  const { data: comments } = useSWR(`/api/comments/${characterId}`);

  const handleSubmit = async (event) => {
    event.preventDefault();
    debugger;
    let comment = { characterId: characterId, name: name, message: message };

    //add comment to local data for immediate response
    mutate(`/api/comments/${characterId}`, [comment, ...comments], false);

    await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comment),
    });

    //trigger a refetch to sync local data with remote
    mutate(`/api/comments/${characterId}`);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="media">
        <div className="media-content">
          <div className="field">
            <label className="label">Name</label>
            <div className="control">
              <input
                required
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">Message</label>
            <div className="control">
              <textarea
                required
                className="textarea"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button type="submit" className="button is-link">
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
      {comments ? <CommentsBody comments={comments} /> : <PageLoader />}
    </>
  );
}

function CommentsBody({ comments }) {
  if (comments.length === 0)
    return (
      <p className="has-text-centered has-text-grey is-size-3">
        It's empty here. Add something!
      </p>
    );

  return comments.map((comment) => {
    const date = new Date(comment.modifiedDate);
    const formattedDate = date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "medium",
    });
    return (
      <div
        key={`comment-${comment.name}-${date.toISOString()}`}
        className="media"
      >
        <div className="media-content">
          <div className="content">
            <p>
              <b>{comment.name}</b>
              <br />
              {comment.message}
              <br />
              {formattedDate}
            </p>
          </div>
        </div>
      </div>
    );
  });
}
