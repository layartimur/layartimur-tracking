import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [fade, setFade] = useState(false);
  const [tagline, setTagline] = useState("");
  const fullText = "Mengantar Kepercayaan";

  useEffect(() => {
    setFade(true);

    let i = 0;
    const interval = setInterval(() => {
      setTagline(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={containerStyle}>
      
      {/* NAVBAR */}
      <nav style={navStyle}>
        <div style={logoNav}>Layar Timur Express</div>
        <div style={navMenu}>
          <Link href="/">Home</Link>
          <Link href="/harga">Harga</Link>
          <Link href="/tracking">Tracking</Link>
          <a href="#kontak">Kontak</a>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ ...overlayStyle, opacity: fade ? 1 : 0 }}>
        <img src="/logo.png" width="120" alt="Logo" />

        <h1 style={titleStyle}>Layar Timur Express</h1>

        <p style={subtitleStyle}>{tagline}</p>

        <div style={buttonWrapper}>
          <Link href="/tracking">
            <button style={btnPrimary}>📦 Tracking Resi</button>
          </Link>

          <Link href="/harga">
            <button style={btnSecondary}>💰 Cek Harga</button>
          </Link>
        </div>
      </div>

      {/* WHATSAPP FLOATING */}
      <a
        href="https://wa.me/6285977833502"
        target="_blank"
        rel="noopener noreferrer"
        style={waStyle}
      >
        💬
      </a>

      {/* FOOTER */}
      <footer id="kontak" style={footerStyle}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h3 style={{ marginBottom: 10 }}>Layar Timur Express</h3>

          <p>
            Jl. Teluk Bitung No. 56 Perak Utara, <br />
            Kec. Pabean Cantikan, Surabaya, <br />
            Jawa Timur – 50612
          </p>

          <p style={{ marginTop: 10 }}>
            Email:{" "}
            <a
              href="mailto:layartimur37@gmail.com"
              style={{ color: "#38bdf8" }}
            >
              layartimur37@gmail.com
            </a>
          </p>

          <p style={{ marginTop: 20, fontSize: 14, color: "#aaa" }}>
            © {new Date().getFullYear()} Layar Timur Express. All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}

/* ================= STYLES ================= */

const containerStyle = {
  minHeight: "100vh",
  backgroundImage:
    "linear-gradient(rgba(15,23,42,0.7), rgba(15,23,42,0.7)), url('/ntt-map.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  flexDirection: "column",
};

const navStyle = {
  position: "absolute",
  top: 0,
  width: "100%",
  padding: "20px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(0,0,0,0.4)",
  color: "white",
};

const logoNav = {
  fontWeight: "bold",
  fontSize: 18,
};

const navMenu = {
  display: "flex",
  gap: 25,
  fontSize: 16,
};

const overlayStyle = {
  background: "rgba(255,255,255,0.92)",
  padding: "60px 40px",
  borderRadius: 20,
  textAlign: "center",
  backdropFilter: "blur(8px)",
  boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
  maxWidth: 500,
  width: "90%",
  transition: "1s ease",
  marginTop: 100,
};

const titleStyle = {
  fontSize: 38,
  fontWeight: "700",
  marginTop: 20,
};

const subtitleStyle = {
  fontSize: 18,
  marginBottom: 40,
  color: "#555",
  minHeight: 24,
};

const buttonWrapper = {
  display: "flex",
  gap: 20,
  flexWrap: "wrap",
  justifyContent: "center",
};

const btnPrimary = {
  padding: "15px 30px",
  fontSize: 16,
  borderRadius: 10,
  border: "none",
  background: "#1e3a8a",
  color: "white",
  cursor: "pointer",
  boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
};

const btnSecondary = {
  padding: "15px 30px",
  fontSize: 16,
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
};

const waStyle = {
  position: "fixed",
  bottom: 25,
  right: 25,
  background: "#25D366",
  color: "white",
  fontSize: 28,
  width: 60,
  height: 60,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
};

const footerStyle = {
  width: "100%",
  background: "#0f172a",
  color: "white",
  padding: "40px 20px",
  textAlign: "center",
  marginTop: 100,
};