import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ripple-kit-00te",
  description: "make me a todo-app using nextjs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
