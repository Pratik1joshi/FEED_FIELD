"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Expedition Map" },
  { href: "/location/kathmandu", label: "Field Documents" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="main-nav-wrapper">
      <nav className="main-nav surface-card">
        <Link className="brand-lockup" href="/">
          {/* <span className="brand-dot" aria-hidden /> */}
          <span>
            <strong>Field Expedition</strong>
            {/* <small>Nepal Route Intelligence</small> */}
          </span>
        </Link>

        <div className="nav-links">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                className={`nav-link ${isActive ? "active" : ""}`}
                key={item.href}
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
