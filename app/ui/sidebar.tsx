
'use client';

import clsx from "clsx";
import Link from "next/link";
import { links } from "./routes";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.



export default function NavLinks() {

  //console.log('abc: ', user)
  // let menuLinks = [links[0]]

 
  return (
    <>
      {/* <div className='flex h-[30px] grow items-center justify-center bg-sky-100 text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3'>
      <b>{`${user?.userName} ${user?.fullName}`}</b>
    </div> */}
      {links.map((link) => {
       // const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium text-gray-800 hover:bg-gray-200 hover:text-gray-900 md:flex-none md:justify-start md:p-2 md:px-3",
              
                'bg-white text-gray-800 shadow'
              
            )
        }
          >
            {/* <LinkIcon className="w-6" /> */}
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
