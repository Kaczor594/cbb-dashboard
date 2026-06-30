"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Target } from "lucide-react";

const NAV = [
  { href: "/", label: "Overview", Icon: Target },
  { href: "/method", label: "Method", Icon: BookOpen },
];

export default function Rail() {
  const path = usePathname();
  return (
    <nav className="rail">
      <div className="rail-top">
        <div className="rail-logo" title="Isaac Kaczor — CBB model">
          i<b>k</b>
        </div>
        {NAV.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`rail-btn ${path === href ? "active" : ""}`}
            title={label}
          >
            <Icon size={18} strokeWidth={1.5} />
          </Link>
        ))}
      </div>
      <div className="rail-bot" />
    </nav>
  );
}
