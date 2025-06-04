
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
        <div className="flex-grow p-6 md:p-1 bg-gray-50 h-screen overflow-auto" style={{ marginTop: '4rem' }}> {/* margin-top để tách biệt với header */}
          {children}
        </div>
      </div>
    </div>
  );
}

