"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";
import { ToastContainer } from "@/components/ui/Toast";

const dashboardPrefixes = ["/admin", "/client", "/partner"];

function isDashboardPath(pathname: string) {
  return dashboardPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dashboard = isDashboardPath(pathname);

  return (
    <>
      {!dashboard && <Navbar />}
      <div className="min-h-screen">
        {children}
      </div>
      {!dashboard && <Footer />}
      <ToastContainer />
    </>
  );
}
