import React from "react";

export default function SeriesCard({ title, thumbnail }) {
  return (
    <div className="card">
      <div className="card-image">
        <figure className="image is-1by1">
          <img
            src={`${thumbnail.path}/standard_fantastic.${thumbnail.extension}`}
          />
        </figure>
      </div>
      <div className="card-content has-background-black has-text-white">
        <p>{title}</p>
      </div>
    </div>
  );
}
