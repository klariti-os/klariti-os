"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

const NavItem: React.FC<{ href: string; title: string }> = ({
  href,
  title,
}) => {
  let isActive = usePathname() === href;
  return (
    <NextLink
      href={href}
      prefetch={false}
      className={`transition-[box-shadow_background-color_border-color] duration-300 motion-reduce:transition-none font-bold m-auto px-4 py-2.5 rounded-lg relative  ${
        isActive && "bg-gray-300/30 "
      }`}
    >
      {title}
      {isActive && (
        <span className="transition-[box-shadow_background-color_border-color] duration-300 motion-reduce:transition-none absolute bottom-0 h-[6px] m-auto w-[50%] inset-x-3 bg-gradient-to-r from-gray-900/0 via-pink-200/80 to-purple-900/10" />
      )}
    </NextLink>
  );
};



const Navigation: React.FC = () => {
  return (
    <div className="h-fit  fixed inset-x-2 text-gray-900 z-50 flex justify-center bottom-4 md:top-4 ">
      <nav className="h-fit transition-[box-shadow_background-color_border-color] duration-300 motion-reduce:transition-none shadow-[0_0_12px_rgba(90,94,82,0.5)] text-sm bg-zinc-400 bg-opacity-[40%] w-[100%] md:w-[80%] backdrop-blur-[10px] border uppercase border-slate-700/20 p-1 font-mono  rounded-lg flex justify-start">
        <NavItem href="/" title="Home" />
        <NavItem href="/join" title="Join" />
        <NavItem href="/manifesto" title="Manifesto" />
        <NavItem href="/resources" title="resources" />
      </nav>
      
    </div>
  );
};

export default Navigation;
