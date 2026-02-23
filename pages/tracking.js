import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [tracking, setTracking] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    const { data, error } = await supabase
      .from("PENGIRIMAN")
      .select("*")
      .eq("tracking_number", tracking.trim())
      .single();

    setTimeout(() => {
      if (error || !data) {
        setError("Nomor resi tidak ditemukan");
      } else {
        setResult(data);
      }
      setLoading(false);
    }, 700);
  };

  const getProgress = (status) => {
    const s = status?.toLowerCase();
    if (s === "diproses") return "33%";
    if (s === "dikirim") return "66%";
    if (s === "sampai") return "100%";
    return "0%";
  };

  const formatRupiah = (value) =>
    "Rp " + Number(value || 0).toLocaleString("id-ID");

  const statusBadge = (status) => {
    if (!status) return null;

    const s = status.toLowerCase();

    let bg = "#9ca3af";
    if (s === "diproses") bg = "#f59e0b";
    if (s === "dikirim") bg = "#3b82f6";
    if (s === "sampai") bg = "#16a34a";

    return (
      <span style={{
        background: bg,
        color: "#fff",
        padding: "5px 12px",
        borderRadius: 20,
        fontSize: 13
      }}>
        {status}
      </span>
    );
  };

  const pembayaranBadge = (status) => {
    if (!status) return null;

    const isLunas = status === "Lunas";

    return (
      <span style={{
        background: isLunas ? "#16a34a" : "#ef4444",
        color: "#fff",
        padding: "5px 12px",
        borderRadius: 20,
        fontSize: 13
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f3f4f6",
      padding: 30,
      display: "flex",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        width: "100%",
        maxWidth: 800,
        borderRadius: 20,
        padding: 30,
        boxShadow: "0 15px 40px rgba(0,0,0,0.08)"
      }}>

        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <img src="/logo.png" width="120" />
          <h2 style={{ marginTop: 15 }}>Tracking Layar Timur</h2>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 10,
              border: "1px solid #ddd"
            }}
            placeholder="Masukkan Nomor Resi"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
          <button
            onClick={handleCheck}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "14px 25px",
              borderRadius: 10,
              cursor: "pointer"
            }}
          >
            Cek
          </button>
        </div>

        {loading && <p style={{ marginTop: 20 }}>Memproses...</p>}
        {error && <p style={{ marginTop: 20, color: "red" }}>{error}</p>}

        {result && (
          <>
            {/* PROGRESS */}
            <div style={{
              height: 8,
              background: "#e5e7eb",
              borderRadius: 5,
              marginTop: 30
            }}>
              <div style={{
                height: 8,
                width: getProgress(result.status_pengiriman),
                background: "#16a34a",
                borderRadius: 5,
                transition: "0.5s"
              }} />
            </div>

            {/* SUMMARY BOX */}
            <div style={{
              marginTop: 30,
              padding: 20,
              background: "#f9fafb",
              borderRadius: 15
            }}>
              <h3 style={{ marginBottom: 15 }}>Ringkasan Pengiriman</h3>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <strong>Status:</strong>
                {statusBadge(result.status_pengiriman)}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <strong>Pembayaran:</strong>
                {pembayaranBadge(result.status_pembayaran)}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <strong>Tanggal Tiba:</strong>
                <span>
                  {result.tanggal_sampai
                    ? new Date(result.tanggal_sampai).toLocaleDateString("id-ID")
                    : "-"}
                </span>
              </div>

              <div style={{
                marginTop: 20,
                padding: 15,
                background: "#fff",
                borderRadius: 10,
                textAlign: "center",
                fontSize: 20,
                fontWeight: "bold",
                color: result.status_pembayaran === "Lunas" ? "#16a34a" : "#111"
              }}>
                Total Harga: {formatRupiah(result.total_harga)}
              </div>
            </div>

            {/* DETAIL TABLE */}
            <table style={{
              width: "100%",
              marginTop: 30,
              borderCollapse: "collapse"
            }}>
              <tbody>
                <tr><td>Tracking</td><td>{result.tracking_number}</td></tr>
                <tr><td>Surat Jalan</td><td>{result.nomor_surat_jalan}</td></tr>
                <tr><td>Tanggal</td><td>{result.tgl_surat_jalan}</td></tr>
                <tr><td>Berat</td><td>{result.berat}</td></tr>
                <tr><td>Pelanggan</td><td>{result.nama_pelanggan}</td></tr>
                <tr><td>Alamat</td><td>{result.alamat}</td></tr>
                <tr><td>No Telpon</td><td>{result.no_telpon}</td></tr>
                <tr><td>Barang</td><td>{result.nama_barang}</td></tr>
                <tr><td>Jumlah</td><td>{result.jumlah_barang}</td></tr>
              </tbody>
            </table>
          </>
        )}

      </div>
    </div>
  );
}