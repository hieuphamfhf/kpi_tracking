import SideNav from "../ui/sidenav";
import '@/app/ui/global.css';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
       <div className="flex justify-between pr-15 pl-15 items-center w-full h-10 px-4 text-white bg-indigo-500 fixed nav">header</div>
     
      <div className="w-full flex-none md:w-64 mt-10">
            <SideNav/>
        </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12 bg-gray-50">{children}</div>
    </div>
  );
}