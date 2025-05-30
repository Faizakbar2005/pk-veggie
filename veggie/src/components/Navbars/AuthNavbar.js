/* eslint-disable */
import React from "react";
import { Link } from "react-router-dom";
import veggieLogo from "../../assets/img/veg.png";

// components
import PagesDropdown from "components/Dropdowns/PagesDropdown.js";

export default function Navbar(props) {
  const [navbarOpen, setNavbarOpen] = React.useState(false);

  return (
    <>
      <nav className="top-0 absolute z-50 w-full shadow-md flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg">
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          {/* Logo dan Toggle */}
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <Link to="/" className="inline-block mr-4 py-2">
              <img
                src={veggieLogo}
                alt="VeggieCast Logo"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <button
              className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <i className="text-white fas fa-bars"></i>
            </button>
          </div>

          {/* Navigasi Tengah dan Kanan */}
          <div
            className={
              "lg:flex flex-grow items-center bg-white lg:bg-opacity-0 lg:shadow-none" +
              (navbarOpen ? " block rounded shadow-lg" : " hidden")
            }
            id="example-navbar-warning"
          >
{/* Judul Dashboard */}
<ul className="flex flex-col lg:flex-row list-none mr-auto">
  <li className="flex items-center">
    <div className="text-black text-base font-extrabold leading-tight inline-block mr-4 py-2 whitespace-nowrap uppercase tracking-wide">
      -{" "}
      <em className="italic not-italic font-semibold">
        Dashboard Interaktif Permintaan Sayuran Jabodetabek
      </em>
    </div>
  </li>
</ul>

          </div>
        </div>
      </nav>
    </>
  );
}
