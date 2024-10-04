// import SideNav from "../ui/sidenav";
// import '@/app/ui/global.css';
// import Header from  "../ui/header";
// export default function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
//        <div className="flex justify-between pr-15 pl-15 items-center w-full h-10 px-4 text-white bg-indigo-500 fixed nav">header</div>
       
//  <div className="w-full flex-none md:w-64 mt-10">
//             <SideNav/>
//         </div>
//       <div className="flex-grow p-6 md:overflow-y-auto md:p-12 bg-gray-50">{children}</div>
//     </div>
//   );
// }


// import SideNav from "../ui/sidenav";
// import '@/app/ui/global.css';
// import Header from "../ui/header";  // Sử dụng component Header thay vì "header" tạm thời

// export default function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
//       {/* Header chính thức */}
//       {/* Header chính thức */}
//       <header className="w-full h-16 fixed top-0 z-10 bg-white text-gray-700 shadow-md">
//         <Header />
//       </header>

//       {/* Nội dung chính với SideNav và Content */}
//       <div className="flex flex-1 mt-16"> {/* mt-16 để không bị trùng với Header */}
//         {/* Side Navigation */}
//         <aside className="w-64 bg-gray-100 h-screen fixed">
//           <SideNav />
//         </aside>

//         {/* Main content */}
//         <main className="flex-1 p-6 bg-gray-50 ml-64 overflow-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

import SideNav from "../ui/sidenav";
import '@/app/ui/global.css';
import Header from "../ui/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between pr-4 pl-4 items-center w-full h-16 px-4 text-white bg-indigo-500 shadow-md">
        <Header />
      </div>

      {/* SideNav và nội dung */}
      <div className="flex flex-row w-full">
        {/* SideNav */}
        <div className="flex-none w-64 bg-gray-100 h-screen pt-16"> {/* pt-16 để tách biệt với header */}
          <SideNav />
        </div>

        {/* Nội dung chính */}
        <div className="flex-grow p-6 md:p-2 bg-gray-50 h-screen overflow-auto" style={{ marginTop: '4rem' }}> {/* margin-top để tách biệt với header */}
          {children}
        </div>
      </div>
    </div>
  );
}

