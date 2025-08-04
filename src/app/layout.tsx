import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Header from '@/_components/Header';
import Footer from '@/_components/Footer';
import { Toaster } from '@/_components/ui/Toasts/Toaster';
import { UserProvider } from '@/_contexts/UserContext';
import { AuthProvider } from '@/_contexts/AuthContext';
import { TooltipProvider } from '@/_components/ui/Tooltip';
import './globals.css';
import 'tippy.js/dist/tippy.css';
import URLToaster from './_components/ui/Toasts/URLToaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Anki AI',
  description: 'AI-powered flashcard learning platform',
  viewport: 'width=device-width, user-scalable=no',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <UserProvider>
          <AuthProvider>
            <TooltipProvider>
              <div className="flex flex-col min-h-screen w-full">
                <Header />
                <div className="flex-grow px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-7xl w-full mx-auto relative">
                  {children}
                </div>
                <Footer />
                <Toaster />
                <URLToaster />
              </div>
              <div id="modal-portal"></div>
            </TooltipProvider>
          </AuthProvider>
        </UserProvider>
      </body>
    </html>
  );
}
