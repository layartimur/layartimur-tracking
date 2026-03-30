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
      text: "Pengiriman barang dari Surabaya ke Kota Kupang,selalu tepat waktu dan bisa tracking nomor resi juga.",
      stars: 5,
      
    },
    {
      name: "Edo",
      role: "Karyawan Swasta",
      text: "saya selalu pakai layar timur ketika mengirim barang ke Waingapu karena termasuk jastip yang memberikan update real-time dengan akurasi tinggi.",
      stars: 5,
      
    },
    {
      name: "Martha",
      role: " Online Shop",
      text: "saya sering kirim pesananan ke pelanggan saya di Ende, Larantuka, Maumere, Ruteng dan Labuan Bajo, dengan jasa layar timur, saya bisa lebih tenang karena packingan barang saya selalu aman dan konsumen saya puas",
      stars: 5,
          }
  ];

  return (
    <div className="min-h-screen bg-[#faf9fd] font-['Public_Sans'] text-[#001d3f]">
      {/* ================= NAVIGATION ================= */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4 flex justify-between items-center ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-lg" : "bg-transparent"}`}>
        <div className="text-xl font-black tracking-tighter text-[#001d3f] uppercase">Layar Timur Express</div>
        <div className="hidden md:flex gap-8 text-sm font-bold tracking-tight text-[#001d3f]/70">
          <Link href="/" className="hover:text-[#001d3f] transition-colors">Home</Link>
         
        </div>
        <div className="flex items-center gap-4">
        </div>
      </nav>
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-48 pb-32 px-8 overflow-hidden bg-[#001d3f]">
        {/* Background Ship Illustration Placeholder */}
        <div className="absolute right-[-5%] bottom-[-10%] opacity-10 w-[400px] h-[400px] md:w-[600px] md:h-[600px]">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="white">
            <path d="M20,150 L180,150 L160,180 L40,180 Z M100,20 L100,140 M100,30 L160,130 L100,130 Z" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-White tracking-tighter text-white mb-8 leading-[0.9]">
            Kisah Mereka yang <br/> <span className="text-blue-300">Telah Berlabuh</span>
          </h1>
          <p className="text-blue-100/70 max-w-xl text-lg font-medium leading-relaxed">
            Kepercayaan Anda adalah kompas kami. Memastikan setiap titipan anda sampai dengan aman dan tepat waktu.
          </p>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 w-full leading-[0]">
          <svg className="relative block w-full h-[40px] md:h-[60px]" viewBox="0 24 150 28" preserveAspectRatio="none">
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
      <section className="py-24 md:py-32 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {reviews.map((item, idx) => (
            <div key={idx} className="group relative bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,29,63,0.04)] border border-slate-100 hover:shadow-[0_40px_80px_rgba(0,29,63,0.08)] hover:-translate-y-3 transition-all duration-500">
              <div className="flex justify-between items-start mb-8">
                 <span className="material-icons text-[#001d3f] text-4xl">format_quote</span>
                 <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(item.stars)].map((_, i) => (
                      <span key={i} className="material-icons text-lg">star</span>
                    ))}
                  </div>
              </div>
              
              <p className="text-slate-600 italic mb-10 leading-relaxed text-lg font-medium">
                "{item.text}"
              </p>
              
              <div className="flex items-center gap-4 pt-8 border-t border-slate-50">
                <img src={item.img} alt={item.name} className="w-14 h-14 rounded-2xl bg-slate-200 object-cover shadow-md" />
                <div>
                  <h4 className="font-black text-[#001d3f] text-base tracking-tight">{item.name}</h4>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="pb-32 px-6 md:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#001d3f] to-[#083261] p-12 md:p-24 rounded-[3rem] md:rounded-[4rem] text-center relative overflow-hidden shadow-2xl shadow-blue-900/40">
           {/* Decorative circles */}
           <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
           
           <h2 className="text-3xl md:text-6xl font-black text-white mb-10 tracking-tighter leading-tight relative z-10">
             Siap Mengirim <br className="hidden md:block"/> Paket Anda?
           </h2>
           
           <div className="flex flex-col md:flex-row gap-4 md:gap-5 justify-center relative z-10">
              <button className="bg-white text-[#001d3f] px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:scale-105 transition-all shadow-xl">
                Mulai Pengiriman
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-white/20 transition-all">
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
            
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[10px] font-black uppercase tracking-widest text-[#d5e3ff]/40">
            <span className="hover:text-white cursor-pointer">Email: layartimur37@gmail.com </span>
            <p className="text-[#d5e3ff]/60 text-xs font-bold">© 2026 All Rights Reserved.</p>
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
