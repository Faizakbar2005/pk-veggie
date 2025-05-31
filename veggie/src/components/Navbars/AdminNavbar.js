import React from "react";

import UserDropdown from "components/Dropdowns/UserDropdown.js";

export default function Navbar({ sidebarOpen = false }) {
  return (
    <>
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-auto items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          {/* Brand - Hide on mobile when sidebar is open, always show on desktop */}
          <div className={`text-black font-extrabold leading-tight inline-block mr-4 py-2 uppercase tracking-wide ${sidebarOpen ? 'md:block hidden' : 'block'}`}>
            {/* Mobile: Stack vertically - Only show when sidebar is closed */}
            <div className="block sm:hidden text-xs">
              <div>VEGGIE</div>
              <div className="font-semibold italic mt-1 normal-case">
                Dashboard Interaktif Permintaan Sayuran Jabodetabek
              </div>
            </div>
          </div>

          {/* User */}
          <ul className="flex-col md:flex-row list-none items-center hidden md:flex">
            <UserDropdown />
          </ul>
        </div>
      </nav>
      {/* End Navbar */}
    </>
  );
}