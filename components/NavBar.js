import React from "react";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link href="/">
          <a className="navbar-item">
            <img src="/marvel-logo.png" alt="Marvel Logo" />
          </a>
        </Link>
        <div className="navbar-item">
          <p className="has-text-white is-size-4-tablet is-size-6-mobile pl-4">
            Unofficial Character Database
          </p>
        </div>
      </div>
    </nav>
  );
}
