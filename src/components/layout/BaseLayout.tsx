import React from "react";
import Navigation from "./Navigation";

const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative flex flex-col justify-center min-h-screen">
      <div
        className="absolute inset-0 bg-repeat "
        style={{
          backgroundImage: `url(/images/pc-land2.png)`,
          backgroundSize: "2000px 2000px",
          backgroundPosition: "center",
          zIndex: -1,
        
        }}
      ></div>
      <div className="transition-[box-shadow_background-color_border-color] duration-300 motion-reduce:transition-none fixed w-full h-full -z-[900] top-0  bg-gradient-to-tr border-2 border-slate-900 from-[#0d0b33] to-[#e7c8e7]"></div>
      <div className="scale-[0.8] z-[90] fixed -top-6 right-2  mt-12 text-slate-400 flex items-center gap-5">
        <a
          href="https://instagram.com/klariti_os"
          target="_blank"
          rel="noreferrer"
          className="w-9 h-9 flex items-center justify-center bg-gray-500 hover:bg-slate-900  rounded-lg"
          aria-label="Instagram"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.605 2C5.027 2 3 4.027 3 6.605v10.789C3 19.973 5.027 22 7.605 22h10.789C18.973 22 21 19.973 21 17.394V6.605C21 4.027 18.973 2 16.394 2H7.605zM16.5 4.3c.42 0 .761.341.761.761 0 .42-.341.761-.761.761-.42 0-.761-.341-.761-.761 0-.42.341-.761.761-.761zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8.199a3.199 3.199 0 110-6.398 3.199 3.199 0 010 6.398z"
              fill="currentColor"
            />
          </svg>
        </a>

        <a
          href="https://github.com/ignasxv"
          target="_blank"
          rel="noreferrer"
          className="w-9 h-9 flex items-center justify-center bg-gray-500 hover:bg-slate-900  rounded-lg"
          aria-label="GitHub"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.5094 20.9056C14.5198 20.402 14.5349 19.6585 14.5349 19C14.5349 18 13.8548 17.0818 13.8548 17.0818C16.1129 16.834 18.4919 15.5037 18.4919 11.5393C18.4919 10.383 18.0887 9.84616 17.4435 9.10284L17.4579 9.0525C17.5588 8.7032 17.8583 7.66631 17.3226 6.29474C16.4758 6.00567 14.5403 7.40972 14.5403 7.40972C13.7339 7.16195 12.8871 7.07936 12 7.07936C11.1532 7.07936 10.3065 7.16195 9.5 7.40972C9.5 7.40972 7.52419 6.04697 6.71774 6.29474C6.15323 7.74009 6.47581 8.81377 6.59677 9.10284C5.95161 9.84616 5.62903 10.383 5.62903 11.5393C5.62903 15.5037 7.92742 16.834 10.1855 17.0818C10.1855 17.0818 9.5 17.8624 9.5 18.9312V20.9082V22.4578C4.76861 21.3309 1.25 17.0764 1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.073 19.2361 21.3252 14.5094 22.4555V20.9056Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
      {children}
      <Navigation />
    </div>
  );
};

export default BaseLayout;
