"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Clock, Database, Settings } from "lucide-react";
import clsx from "clsx";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Hitung", href: "/", icon: Calculator },
    { name: "Riwayat", href: "/riwayat", icon: Clock },
    { name: "Master", href: "/master", icon: Database },
    { name: "Pengaturan", href: "/pengaturan", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
