import Link from "next/link";

export default function Home() {
  return (
    <div style={containerStyle}>
      <div style={overlayStyle}>
        <img src="/logo.png" width="120" alt="Logo" />

        <h1 style={titleStyle}>Layar Timur Express</h1>

        <p style={subtitleStyle}>
          Mengantar Kepercayaan
        </p>

        <div style={buttonWrapper}>
          <Link href="/tracking">
            <button style={btnPrimary}>📦 Tracking Resi</button>
          </Link>

          <Link href="/harga">
            <button style={btnSecondary}>💰 Cek Harga</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  backgroundImage:
    "linear-gradient(rgba(15,23,42,0.6), rgba(15,23,42,0.6)), url('/ntt-map.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const overlayStyle = {
  background: "rgba(255,255,255,0.9)",
  padding: "60px 40px",
  borderRadius: 20,
  textAlign: "center",
  backdropFilter: "blur(8px)",
  boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
  maxWidth: 500,
  width: "90%",
};

const titleStyle = {
  fontSize: 38,
  fontWeight: "700",
  marginTop: 20,
  letterSpacing: 1,
};

const subtitleStyle = {
  fontSize: 18,
  marginBottom: 40,
  color: "#555",
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
  transition: "0.3s",
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
  transition: "0.3s",
};