import PillButton from "@/components/PillButton"
import { Metadata, NextPage } from "next"
import Head from "next/head"

const metadata: Metadata = {
  title: "Projects — ignasxv.com",
}

const ProjectsPage: NextPage = () => {
  return (
    <>
      <div className="px-6">
        <main className="w-full max-w-2xl mx-auto mt-10 mb-20">
          <h1 className="text-xl font-medium">Projects</h1>
          <p className="mt-4">Things I have built or attempted to</p>
          
          {/* <div className="mt-6">
            <div className="flex flex-col max-w-3xl space-y-3">
            <PillButton href="https://teksafari.org">teKsafari .ORG</PillButton>
            <PillButton href="https://floracc.vercel.app">Flora Systems</PillButton>
            <PillButton href="https://klariti.org">Klariti OS</PillButton>
            <PillButton href="https://math.teksafari.org">MathSafari Kits</PillButton>
            </div>
          </div> */}
        </main>
      </div>
    </>
  )
}

export default ProjectsPage
