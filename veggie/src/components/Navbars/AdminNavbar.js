import React from "react";

import UserDropdown from "components/Dropdowns/UserDropdown.js";

export default function Navbar() {
  return (
    <>
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-autp items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          {/* Brand */}
          {/* Brand */}
<div
  className="text-black text-base font-extrabold leading-tight inline-block mr-4 py-2 whitespace-nowrap uppercase tracking-wide"
>
  Veggie – <em className="italic not-italic font-semibold">Dashboard Interaktif Permintaan Sayuran Jabodetabek</em>
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
