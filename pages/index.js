import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  // Loading Animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setVisible(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Navbar Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll Fade Animation
  useEffect(() => {
    const elements = document.querySelectorAll(".fadeScroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("showFade");
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="loadingScreen">
        <div className="loaderPremium"></div>
        <p>Loading Layar Timur Express...</p>
      </div>
    );
  }

  return (
    <div className="heroPremium">

      {/* ================= NAVBAR ================= */}
      <nav className={`navbarPremium ${scrolled ? "scrolled" : ""}`}>
        <div className="logoPremium">Layar Timur Express</div>

        <div className={`navLinksPremium ${menuOpen ? "active" : ""}`}>
          <Link href="/" onClick={()=>setMenuOpen(false)}>Home</Link>
          <Link href="/tentang" onClick={()=>setMenuOpen(false)}>Tentang</Link>
          <Link href="/harga" onClick={()=>setMenuOpen(false)}>Harga</Link>
          <Link href="/tracking" onClick={()=>setMenuOpen(false)}>Tracking</Link>
          <a href="#kontak" onClick={()=>setMenuOpen(false)}>Kontak</a>
        </div>

        <div 
          className={`hamburgerPremium ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* ================= HERO CARD ================= */}
      <div className={`heroCardPremium ${visible ? "show" : ""}`}>
        <img src="/logo.png" width="120" alt="Logo" />

        <h1>Layar Timur Express</h1>
        <p>Mengantar Kepercayaan</p>

        <div className="heroButtonsPremium">
          <Link href="/tracking">
            <button className="btnPrimaryPremium">
              📦 Tracking Resi
            </button>
          </Link>

          <Link href="/harga">
            <button className="btnSecondaryPremium">
              💰 Cek Harga
            </button>
          </Link>
        </div>
      </div>

      {/* ================= MARKETPLACE ================= */}
      <div className="marketplaceSection fadeScroll">
        <div className="marketplaceContainer">

          <a href="#" target="_blank" rel="noopener noreferrer">
            <img src="/tiktok.png" alt="TikTok Shop" />
          </a>

          <a href="#" target="_blank" rel="noopener noreferrer">
            <img src="/shopee.png" alt="Shopee" />
          </a>

          <a href="#" target="_blank" rel="noopener noreferrer">
            <img src="/lazada.png" alt="Lazada" />
          </a>

          <a href="#" target="_blank" rel="noopener noreferrer">
            <img src="/tokopedia.png" alt="Tokopedia" />
          </a>

        </div>
      </div>

      {/* ================= WHATSAPP ================= */}
      <a
        href="https://wa.me/6285977833502"
        target="_blank"
        rel="noopener noreferrer"
        className="waPremium"
      >
        💬
      </a>

      {/* ================= FOOTER ================= */}
      <footer id="kontak" className="footerPremium">
        <h3>Layar Timur Express</h3>
        <p>
          Jl. Teluk Bitung No. 56 Perak Utara<br/>
          Kec. Pabean Cantikan, Surabaya<br/>
          Jawa Timur – 50612
        </p>
        <p>Email: layartimur37@gmail.com</p>
        <p>© {new Date().getFullYear()} All Rights Reserved</p>
      </footer>

    </div>
  );
}