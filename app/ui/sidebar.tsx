'use client';

import clsx from "clsx";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { links } from "./routes";

export default function NavLinks() {
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);

  // Check URL admin_key khi component mount (chỉ chạy client-side)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsManager(params.get('admin_key') === 'secret123'); // đổi mã đúng của bạn
    }
  }, []);

  // Lọc links chỉ hiện khi đủ quyền
  // const filteredLinks = useMemo(() => {
  //   return links.filter(link => {
  //     if (link.onlyManager && !isManager) return false;
  //     return true;
  //   });
  // }, [isManager]);


  const filteredLinks = useMemo(() => {
    if (isManager) {
      // Nếu là admin, chỉ trả về link có onlyManager: true
      return links.filter(link => link.onlyManager);
    } else {
      // Nếu không phải admin, chỉ trả về link KHÔNG có onlyManager
      return links.filter(link => !link.onlyManager);
    }
  }, [isManager]);

  // Lấy lại query hiện tại từ URL để append vào các link
  function addAdminKeyToHref(href: string) {
    if (isManager) {
      // Nếu đã có query, thêm vào sau dấu &
      if (href.includes("?")) {
        return `${href}&admin_key=secret123`; 
      } else {
        return `${href}?admin_key=secret123`;
      }
    }
    return href;
  }


  return (
    <>
      {filteredLinks.map((link) => {
        const LinkIcon = link.icon;
        const isActive = activeLink === link.href;

        return (
          <Link
            key={link.name}
            // href={link.href}
            href={addAdminKeyToHref(link.href)} // sử dụng hàm này
            onClick={() => setActiveLink(link.href)}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium text-gray-800 hover:bg-gray-300 hover:text-gray-900 md:flex-none md:justify-start md:p-2 md:px-3",
              isActive
                ? "bg-gray-500 text-white font-bold shadow-md"
                : "bg-white text-gray-800 shadow"
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
