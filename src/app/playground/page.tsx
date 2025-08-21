import PillButton from "@/components/PillButton"
import { Metadata, NextPage } from "next"
import Head from "next/head"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Playground — Klariti OS",
}

const ToolsPage: NextPage = () => {
  return (
    <>
      <div className="px-6">
        <main className="w-full max-w-2xl mx-auto mt-10 mb-20">
          <h1 className="text-xl font-medium">Playground</h1>
          <p className="mt-4 ">Testing and viewing demos and protypes</p>

          <div className="mt-6">
            <div className="flex flex-col max-w-3xl space-y-2">
        
              <Link legacyBehavior href="playground/ios">
                  <PillButton>Klariti iOS app mockup</PillButton>
              </Link>

            </div> 
          </div>
        </main>
      </div>
    </>
  )
}

export default ToolsPage
