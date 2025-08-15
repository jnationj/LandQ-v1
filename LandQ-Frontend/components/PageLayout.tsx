'use client'

import React from "react"
import Footer from "@/components/Footer"
import LandingHeader from "./LandingHeader"

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingHeader />
      <main>{children}</main>
      <Footer />
    </>
  )
}
