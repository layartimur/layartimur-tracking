import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f7fb",
      fontFamily: "Arial"
    }}>
      
      <img src="/logo.png" width="120" alt="Logo" />
<h1 style={{ marginTop: 20, fontSize: 36, fontWeight: "bold" }}>
  Layar Timur Express
</h1>
<p style={{ marginBottom: 40, fontSize: 18, color: "#555" }}>
  Mengantar Kepercayaan
</p>

      <div style={{
        display: "flex",
        gap: 20,
        flexWrap: "wrap",
        justifyContent: "center"
      }}>

        <Link href="/tracking">
          <button style={btnStyle}>📦 Tracking Resi</button>
        </Link>

        <Link href="/harga">
          <button style={btnStyle}>💰 Cek Harga</button>
        </Link>

      </div>

    </div>
  );
}

const btnStyle = {
  padding: "15px 30px",
  fontSize: 16,
  borderRadius: 8,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer"
};