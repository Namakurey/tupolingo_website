import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo.png"
        alt="TuPoLingo logo"
        width={36}
        height={36}
        className="size-9 rounded-xl object-cover"
      />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight">TuPoLingo</span>
        <span className="mt-1.5 text-[10px] font-medium tracking-[0.18em] text-text3 uppercase">
          Breakthrough the Language Barrier
        </span>
      </span>
    </span>
  );
}