'use client';

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { links } from "./routes";

export default function NavLinks() {
  const [activeLink, setActiveLink] = useState<string | null>(null);

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = activeLink === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={() => setActiveLink(link.href)}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium text-gray-800 hover:bg-gray-200 hover:text-gray-900 md:flex-none md:justify-start md:p-2 md:px-3",
              isActive
                ? "bg-gray-300 text-gray-900 shadow" // Màu nền và viền khi được chọn
                : "bg-white text-gray-800 shadow" // Giữ nền trắng và viền khi không được chọn
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}

// className={clsx(
//   "flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium md:flex-none md:justify-start md:p-2 md:px-3",
//   isActive
//     ? "bg-gray-300 text-gray-900 shadow-md" // Bóng đổ vừa cho mục được chọn
//     : "bg-white text-gray-800 shadow-sm hover:bg-gray-200 hover:text-gray-900" // Bóng nhẹ cho các mục không được chọn
// )}
