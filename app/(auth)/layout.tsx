import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import React, { ReactNode } from "react";
import "../../app/globals.css";

interface Props {
  children: ReactNode;
}

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Threds",
  description: "Threads with NextJs",
};

export default function layout({ children }: Props) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>
          <div className="w-full flex justify-center items-center min-h-screen">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
