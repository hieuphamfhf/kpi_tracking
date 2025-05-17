// components/ui/LogoLoading.tsx
interface LogoLoadingProps {
  message?: string;
  size?: number;
}

export default function LogoLoading({ size = 120 }: LogoLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500 relative overflow-hidden">
      <div className="relative">
        <img
          src="/img/logo.png"
          alt="Loading..."
          style={{ width: size, height: 'auto' }} 
          className="opacity-80"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer rounded" />
      </div>
      {/* <span className="mt-4 text-sm">{message}</span> */}
    </div>
  );
}
