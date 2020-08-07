import React from "react";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav
      className="navbar is-primary"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <Link href="/">
          <a className="navbar-item">[Marvel Logo]</a>
        </Link>
      </div>
    </nav>
  );
}
