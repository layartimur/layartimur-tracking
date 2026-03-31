import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Testimoni() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const reviews = [
    {
            name: "Anita Wahyuni",
      role: "Ibu Rumah Tangga",
      text: "Pengiriman barang dari Surabaya ke Kota Kupang, selalu tepat waktu dan bisa tracking nomor resi juga.",
      stars: 5,
      img: "/Anita Wahyuni.png"

    },
    {
      name: "Edo",
      name: "Edo",
      role: "Karyawan Swasta",
      text: "Saya selalu pakai Layar Timur ketika mengirim barang ke Waingapu karena termasuk jastip yang memberikan update real-time dengan akurasi tinggi.",
      stars: 5,
      img: "/Edo.png"
    },
    {
      name: "Martha",
      role: "Online Shop",
      text: "Saya sering kirim pesanan ke pelanggan saya di Ende, Larantuka, Maumere, Ruteng, dan Labuan Bajo. Dengan jasa Layar Timur, saya bisa lebih tenang karena packingan barang saya selalu aman dan konsumen saya puas.",
      stars: 5,
      img: "/Martha.png"

    }
  ];

  return (
    <div className="min-h-screen bg-[#faf9fd] font-['Public_Sans'] text-[#001d3f]">
      {/* ================= NAVIGATION ================= */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4 flex justify-between items-center ${scrolled ? "bg-[#001d3f]/80 backdrop-blur-xl shadow-lg" : "bg-transparent"}`}>
        <div className="text-xl font-black tracking-tighter text-white uppercase">Layar Timur Express</div>
        <div className="hidden md:flex gap-8 text-sm font-bold tracking-tight text-white/80">
          <Link href="/" className="hover:text-white transition-colors">Tracking</Link>
          <Link href="/" className="hover:text-white transition-colors">Services</Link>
          <Link href="/" className="hover:text-white transition-colors">Fleet</Link>
          <Link href="/testimoni" className="text-white border-b-2 border-blue-200 pb-1">Testimonials</Link>
          <Link href="/" className="hover:text-white transition-colors">Network</Link>
        </div>
        <div className="flex items-center gap-4">
           <button className="text-white p-2 hover:bg-white/10 rounded-full transition-all"><span className="material-icons text-xl">language</span></button>
           <button className="text-white p-2 hover:bg-white/10 rounded-full transition-all"><span className="material-icons text-xl">account_circle</span></button>
           <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-900/20">Ship Now</button>
        </div>
      </nav>
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-48 pb-32 px-8 overflow-hidden bg-[#001d3f]">
        {/* Background Ship Illustration Placeholder */}
        <div className="absolute right-[-5%] bottom-[-10%] opacity-10 w-[600px] h-[600px]">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="white">
            <path d="M20,150 L180,150 L160,180 L40,180 Z M100,20 L100,140 M100,30 L160,130 L100,130 Z" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
            Kisah Mereka yang <br/> <span className="text-blue-300">Telah Berlabuh</span>
          </h1>
          <p className="text-blue-100/70 max-w-xl text-lg font-medium leading-relaxed">
            Kepercayaan Anda adalah kompas kami. Memastikan setiap titipan anda sampai dengan aman dan tepat waktu.
          </p>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 w-full leading-[0]">
          <svg className="relative block w-full h-[60px]" viewBox="0 24 150 28" preserveAspectRatio="none">
            <defs><path id="wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" /></defs>
            <g className="parallax">
              <use href="#wave" x="48" y="0" fill="rgba(250,249,253,0.7)" />
              <use href="#wave" x="48" y="3" fill="rgba(250,249,253,0.5)" />
              <use href="#wave" x="48" y="5" fill="rgba(250,249,253,0.3)" />
              <use href="#wave" x="48" y="7" fill="#faf9fd" />
            </g>
          </svg>
        </div>
      </section>

      {/* ================= TESTIMONIALS GRID ================= */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {reviews.map((item, idx) => (
            <div key={idx} className="group relative bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,29,63,0.04)] border border-slate-100 hover:shadow-[0_40px_80px_rgba(0,29,63,0.08)] hover:-translate-y-3 transition-all duration-500">
              {/* Quote Icon */}
              <div className="absolute -top-6 left-10 w-12 h-12 bg-[#001d3f] text-white rounded-2xl flex items-center justify-center shadow-xl">
                <span className="material-icons">format_quote</span>
              </div>
              
              <div className="flex gap-1 mb-8 text-yellow-400 mt-2">
                {[...Array(item.stars)].map((_, i) => (
                  <span key={i} className="material-icons text-xl">star</span>
                ))}
              </div>
              
              <p className="text-slate-600 italic mb-12 leading-relaxed text-lg font-medium">
                "{item.text}"
              </p>
              
              <div className="flex items-center gap-5 pt-8 border-t border-slate-50">
                <img src={item.img} alt={item.name} className="w-14 h-14 rounded-2xl bg-slate-200 object-cover shadow-md" />
                <div>
                  <h4 className="font-black text-[#001d3f] text-lg tracking-tight">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="pb-32 px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#001d3f] to-[#083261] p-16 md:p-24 rounded-[4rem] text-center relative overflow-hidden shadow-2xl shadow-blue-900/40">
           {/* Decorative circles */}
           <div className="absolute top-[-5%] left-[-10%] w-64 h-64 bg-yellow/5 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
           
           <h2 className="text-4xl md:text-6xl font-black text-white mb-10 tracking-tighter leading-tight relative z-10">
             Siap Mengirim <br className="hidden md:block"/> Paket Anda?
           </h2>
           
           <div className="flex flex-col md:flex-row gap-5 justify-center relative z-10">
              <button className="bg-white text-[#001d3f] px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl">
                Mulai Pengiriman
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all">
                Hubungi Marketing
              </button>
           </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#00152b] text-white py-16 md:py-24 px-8 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <h3 className="text-lg font-black tracking-tighter uppercase mb-2">Layar Timur Express</h3>
            <p className="text-[#d5e3ff]/60 text-xs font-bold">Titipanmu, Urusanku.</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d5e3ff]/40 hover:text-white cursor-pointer">Email: layartimur37@gmail.com</span>
            <p className="text-[#d5e3ff]/60 text-[10px] font-bold">© 2026 Layar Timur Express. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;900&display=swap');
        
        .parallax > use {
          animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
        }
        .parallax > use:nth-child(1) { animation-delay: -2s; animation-duration: 7s; }
        .parallax > use:nth-child(2) { animation-delay: -3s; animation-duration: 10s; }
        .parallax > use:nth-child(3) { animation-delay: -4s; animation-duration: 13s; }
        .parallax > use:nth-child(4) { animation-delay: -5s; animation-duration: 20s; }
        
        @keyframes move-forever {
          0% { transform: translate3d(-90px,0,0); }
          100% { transform: translate3d(85px,0,0); }
        }
      `}</style>
    </div>
  );
}
