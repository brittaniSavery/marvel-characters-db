import React from "react";

export default function Message({ title, variant, children }) {
  <div className={`message ${variant && `is-${variant}`}`}>
    {title && <div className="message-header">{title}</div>}
    <div className="message-body">{children}</div>
  </div>;
}
