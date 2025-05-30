/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";

import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import veggieLogo from "../assets/img/veg.png";
import oktaImg from "assets/img/okta.jpg";
import faizImg from "assets/img/faiz.jpg";
import widiaImg from "assets/img/widia.jpg";

export default function Index() {
  return (
    <>
      <IndexNavbar fixed />

{/* Hero Section */}
<section className="relative pt-16 flex items-center min-h-screen w-full overflow-hidden">
  {/* Gambar Background sebagai elemen */}
  <img
    src={require("../assets/img/bg.jpg")}
    alt="Background"
    className="absolute inset-0 w-full h-full object-cover z-0"
  />

  {/* Overlay gelap */}
  <div className="absolute inset-0 bg-black opacity-50"></div>

  {/* Gambar say.png di pojok kanan */}
<img
  src={require("../assets/img/sayy.svg").default}
  alt="Say Icon"
  className="absolute right-0 top-1/2 transform -translate-y-1/2 w-48 h-48 object-contain z-20"
/>

  {/* Konten hero */}
  <div className="container mx-auto relative z-10 flex flex-wrap items-center">
    <div className="container mx-auto relative z-10 flex flex-wrap items-center px-4 py-16">
      <div className="w-full md:w-8/12 lg:w-6/12 text-center md:text-left">
        <img
          src={veggieLogo}
          alt="VeggieCast Logo"
          className="w-48 max-w-full h-auto mb-2"
          style={{ maxWidth: "70%" }}
        />
        <p className="mt-4 text-lg leading-relaxed font-semibold text-black">
          By Epic Sciency Team
        </p>

        <div className="mt-12">
          <Link
            to="/auth/login"
            className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* About Us */}
      <section className="py-20 bg-veggie-green">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-semibold text-blueGray-700">About Us</h2>
            <p className="mt-4 text-lg text-blueGray-500">
              Veggie adalah sistem dashboard yang dirancang untuk membantu tim sales menganalisis
              data HORECA terkhususnya di wilayah JABODETABEK untuk mengakuisisi data customer potensial.
              Platform ini membantu dalam pengambilan keputusan berbasis data untuk distribusi dan penjualan sayuran.
            </p>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-semibold text-blueGray-700">Our Team</h2>
            <p className="mt-4 text-lg text-blueGray-500 mb-12">
              Mahasiswa Politeknik Negeri Jakarta yang sedang menempuh D4 Program Studi Teknik Informatika.
              Kami berdedikasi dalam menciptakan solusi digital yang membantu meningkatkan efisiensi penjualan hasil pertanian.
            </p>
          </div>
          <div className="flex flex-wrap justify-center">
            {[
              { name: "Asiwidia Simanjuntak", nim: "2207411030", role: "FrontEnd Engineer", img: widiaImg },
              { name: "Okta Gabriel Sinsaku Sinaga", nim: "2207411017", role: "Backend Developer", img: oktaImg },
              { name: "Faiz Akbar", nim: "2207411010", role: "AI Engineer", img: faizImg },
            ].map((member, index) => (
              <div className="w-full md:w-4/12 lg:w-3/12 px-4 text-center mb-10" key={index}>
                <img
                  alt={member.name}
                  src={member.img}
                  className="shadow-lg rounded-full max-w-full mx-auto mb-4"
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                />
                <h5 className="text-xl font-semibold">{member.name}</h5>
                <p className="text-blueGray-500">{member.nim}</p>
                <p className="text-blueGray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
