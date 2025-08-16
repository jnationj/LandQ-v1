'use client';

import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";
import Header from "../components/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Geist, Geist_Mono } from "next/font/google";
import ChatbotWrapper from "@/components/ChatbotWrapper";
import { config } from "./wagmi";

const client = new QueryClient();




const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={client}>
            <RainbowKitProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
              <ChatbotWrapper />
              <ToastContainer position="top-right" autoClose={5000} />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}