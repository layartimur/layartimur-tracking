import React from "react";
import { motion } from "framer-motion";

export default function LandingPage() {

  const reviews = [
    {
      name: "Anita Wahyuni",
      role: "Ibu Rumah Tangga",
      text: "Pengiriman barang dari Surabaya ke Kota Kupang selalu tepat waktu dan aman.",
      
    },
    {
      name: "Edo",
      role: "Karyawan Swasta",
      text: "Update real-time sangat akurat, jadi lebih tenang kirim barang.",
      
    },
    {
      name: "Martha",
      role: "Online Shop",
      text: "Barang aman sampai pelanggan, sangat membantu bisnis saya.",
      
    }
  ];

  return (
    <div className="bg-[#0a0f1c] text-white min-h-screen font-sans">

      {/* HERO */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight"
        >
          Titip Barang ke NTT <br />
          <span className="text-blue-400">Lebih Cepat & Aman</span>
        </motion.h1>

        <p className="mt-6 text-white/70 max-w-xl text-sm sm:text-base md:text-lg">
          Jastip terpercaya dengan tracking real-time dan pengiriman aman ke seluruh NTT.
        </p>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {["Cepat", "Aman", "Tracking Real-time"].map((item, i) => (
            <div key={i} className="bg-white/5 p-6 rounded-xl text-center">
              <h3 className="text-lg md:text-xl font-bold">{item}</h3>
              <p className="text-white/60 text-sm mt-2">
                Layanan profesional untuk memastikan barang sampai dengan aman dan tepat waktu.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONI */}
      <section className="py-20 px-4 bg-[#111827]">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-12">
          Apa Kata Mereka?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((item, i) => (
            <div key={i} className="bg-white text-black p-6 rounded-2xl shadow-lg hover:shadow-xl transition">

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">

              
                {/* TEXT CONTENT */}
                <div className="flex-1 text-center sm:text-left">

                  {/* ⭐ BINTANG */}
                  <div className="flex justify-center sm:justify-start text-yellow-400 text-sm md:text-base">
                    {[...Array(5)].map((_, index) => (
                      <span key={index}>★</span>
                    ))}
                  </div>

                  {/* TEXT */}
                  <p className="italic text-sm mt-1">
                    "{item.text}"
                  </p>

                  {/* NAME */}
                  <div className="mt-2">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.role}</p>
                  </div>

                </div>

              </div>

            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-4">
        <h2 className="text-3xl md:text-5xl font-black mb-6">
          Siap Kirim Barang?
        </h2>
        <button className="bg-blue-500 px-10 py-5 rounded-xl font-bold hover:bg-blue-600 transition">
          Chat Kami Sekarang
        </button>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-white/50 text-sm">
        © 2026 Layar Timur Express
      </footer>

    </div>
  );
}