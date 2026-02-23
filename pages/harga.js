export default function Harga() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 40,
        background: "#f5f7fb",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginBottom: 10 }}>Cek Harga Pengiriman</h1>
      <p style={{ marginBottom: 30 }}>
        Berikut estimasi harga pengiriman per kilogram (Kg) dari Surabaya:
      </p>

      <table
        style={{
          borderCollapse: "collapse",
          background: "white",
          minWidth: 500,
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <thead style={{ background: "#1e3a8a", color: "white" }}>
          <tr>
            <th style={thStyle}>Rute Pengiriman</th>
            <th style={thStyle}>Harga / Kg</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>Surabaya - Ende</td>
            <td style={tdStyle}>Rp 5.000 / Kg</td>
          </tr>
          <tr>
            <td style={tdStyle}>Surabaya - Kupang</td>
            <td style={tdStyle}>Rp 8.000 / Kg</td>
          </tr>
          <tr>
            <td style={tdStyle}>Surabaya - Waingapu</td>
            <td style={tdStyle}>Rp 6.000 / Kg</td>
          </tr>
          <tr>
            <td style={tdStyle}>Surabaya - Tambolaka</td>
            <td style={tdStyle}>Rp 10.000 / Kg</td>
          </tr>
          <tr>
            <td style={tdStyle}>Surabaya - Kefa</td>
            <td style={tdStyle}>Rp 15.000 / Kg</td>
          </tr>
        </tbody>
      </table>

      {/* KETERANGAN TAMBAHAN */}
      <div
        style={{
          marginTop: 40,
          padding: 20,
          background: "#fff3cd",
          borderRadius: 8,
          maxWidth: 700,
        }}
      >
        <h3 style={{ marginBottom: 10 }}>⚠️ Ketentuan Khusus</h3>
        <p style={{ marginBottom: 10 }}>
          Untuk pengiriman <strong>barang elektronik</strong>, perhitungan
          biaya dapat berbeda tergantung jenis barang, nilai barang, dan
          metode pengiriman.
        </p>
        <p>
          Silakan hubungi admin untuk mendapatkan informasi dan penawaran
          harga terbaik.
        </p>

        <a
          href="https://wa.me/6285977833502"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 15,
            padding: "10px 20px",
            background: "#25D366",
            color: "white",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Hubungi Admin via WhatsApp
        </a>
      </div>
    </div>
  );
}

const thStyle = {
  padding: 12,
  textAlign: "left",
};

const tdStyle = {
  padding: 12,
  borderBottom: "1px solid #eee",
};