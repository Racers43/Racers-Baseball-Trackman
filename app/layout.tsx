import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata={title:"Racers TrackMan Analytics",description:"Murray State baseball TrackMan analytics dashboard"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}