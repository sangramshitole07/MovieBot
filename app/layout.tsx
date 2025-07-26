import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CSV Chatbot - AI-Powered Data Analysis',
  description: 'Upload CSV files and chat with your data using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-black via-gray-900 to-black text-white min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}