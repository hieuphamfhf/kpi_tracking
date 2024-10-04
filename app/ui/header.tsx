import { UserIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 w-full fixed top-0 left-0 z-10"> {/* Loại bỏ bất kỳ margin hoặc padding không cần thiết */}
      <div className="w-full px-6 py-3 flex justify-between items-center">
        {/* Logo và tiêu đề hệ thống */}
        <div className="flex items-center space-x-4">
          <img src="/img/logo.png" alt="Logo" className="h-10" /> 
          <h1 className="text-lg font-bold text-gray-700">
            河靜鋼鐵企業入口網站(EIP)
          </h1>
        </div>

        {/* Thông tin người dùng và logout */}
        <div className="flex items-center space-x-4">
          {/* Thông tin tài khoản */}
          <div className="flex items-center space-x-2">
            <UserIcon className="h-8 w-8 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              vnw0018118
            </span>
          </div>

          {/* Nút Logout */}
          <Button variant="ghost" className="flex items-center space-x-2 text-gray-700">
            <LogOutIcon className="h-5 w-5" />
            <span>登出</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
