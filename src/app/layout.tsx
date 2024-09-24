import Footer from "@/components/footer";
import "./globals.css";
import { Recursive } from 'next/font/google'
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import Provider from "@/components/Provider";
import { constructMetadata } from "@/lib/utils";

const recursive = Recursive({subsets: ['latin']})

export const metadata = constructMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={recursive.className}>
        <Navbar />
        <main className="flex flex-col min-h-[calc(100vh-3.5rem-1px)] grainy-light">
          <div className="flex-1 flex flex-col h-full">
            <Provider>{children}</Provider>
          </div>
          <Footer />
        </main>
        <Toaster />
      </body>
    </html>
  );
}
