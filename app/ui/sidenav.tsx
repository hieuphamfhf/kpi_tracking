'use client'

import NavLinks from "./sidebar";




export default function SideNav() {
  return (
    
    <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-gray-50">
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks/>
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block bg-white shadow"></div>
     
      </div>
      {/* <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
       <div>BASE</div>
      </div> */}
    </div>
  );
}
