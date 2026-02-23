import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setVisible(true);
    }, 1500);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

      {/* NAVBAR */}
      <nav className={`navbarPremium ${scrolled ? "scrolled" : ""}`}>
        <div className="logoPremium">Layar Timur Express</div>

        <div className={`navLinksPremium ${menuOpen ? "active" : ""}`}>
          <Link href="/">Home</Link>
          <Link href="/harga">Harga</Link>
          <Link href="/tracking">Tracking</Link>
          <a href="#kontak">Kontak</a>
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

      {/* HERO CARD */}
      <div className={`heroCardPremium ${visible ? "show" : ""}`}>
        <img src="/logo.png" width="120" alt="Logo" />

        <h1>Layar Timur Express</h1>

        <p>
          Mengantar Kepercayaan
        </p>

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

      {/* WHATSAPP */}
      <a
        href="https://wa.me/6285977833502"
        target="_blank"
        rel="noopener noreferrer"
        className="waPremium"
      >
        💬
      </a>

      {/* FOOTER */}
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