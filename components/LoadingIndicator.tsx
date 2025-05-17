// components/LoadingIndicator.tsx
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
  className?: string; 
  iconSize?: number; 
}

export default function LoadingIndicator({
  message = "Đang tải dữ liệu...",
  className = "",
  iconSize = 20,
}: LoadingIndicatorProps) {
  return (
    <div className={`flex items-center justify-center py-6 text-gray-500 gap-2 ${className}`}>
      <Loader2 className="animate-spin" style={{ width: iconSize, height: iconSize }} />
      <span>{message}</span>
    </div>
  );
}
