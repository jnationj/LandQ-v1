// components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showHeader = pathname !== "/";
  // showHeader is true for all paths except the root path and /faq ("/faq" is handled in app/faq/page.tsx)
  const isFAQPage = pathname !== "/faq";

  return (
    <>
      {showHeader && isFAQPage && <Header />}
      {children}
    </>
  );
}
