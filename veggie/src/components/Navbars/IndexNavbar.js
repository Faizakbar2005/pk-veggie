/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";
// components


export default function Navbar(props) {
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  return (
    <>
      <nav className="top-0 fixed z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg bg-white shadow">
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <div
  className="text-black text-sm sm:text-base md:text-lg lg:text-xl font-extrabold leading-tight inline-block mr-4 py-2 whitespace-normal uppercase tracking-wide"
>

              Veggie – <em className="italic not-italic font-semibold">Dashboard Interaktif Permintaan Sayuran Jabodetabek</em>
            </div>

     
          </div>
        </div>
      </nav>
    </>
  );
}
