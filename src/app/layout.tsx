import type { Metadata } from "next";
import "./globals.css";
import "./tiptap.css";
import { AuthCheck } from "@/components/auth-check";
import Sidebar from "@/components/sidebar";

export const metadata: Metadata = {
  title: "dekord Admin Panel",
  description: "Manage your dekord e-commerce store",
  icons: {
    icon: '/favi.png',
    shortcut: '/favi.png',
    apple: '/favi.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50">
        <AuthCheck>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 w-full">
              {children}
            </main>
          </div>
        </AuthCheck>
      </body>
    </html>
  );
}
