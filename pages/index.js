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
    }, 800);
  };

  const getProgress = (status) => {
    const s = status?.trim().toLowerCase();
    if (s === "diproses") return "33%";
    if (s === "dikirim") return "66%";
    if (s === "sampai") return "100%";
    return "0%";
  };

  const normalizeStatus = (status) =>
    status?.trim().toLowerCase() || "";

  const formatRupiah = (value) => {
    return "Rp " + Number(value || 0).toLocaleString("id-ID");
  };

  return (
    <div className="container">
      <div className="card">

        <div className="logoBox">
          <img src="/logo.png" width="120" alt="Logo" />
          <h2>Tracking Layar Timur</h2>
        </div>

        <div className="searchBox">
          <input
            type="text"
            placeholder="Masukkan Nomor Resi"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
          <button onClick={handleCheck}>Cek</button>
        </div>

        {loading && (
          <div style={{ marginTop: 20 }}>
            <div className="spinner"></div>
            <p>Memproses tracking...</p>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        {result && (
          <>
            <div className="progressContainer">
              <div
                className="progressBar"
                style={{ width: getProgress(result.status_pengiriman) }}
              ></div>
            </div>

            <div className="timeline">
              <div className={`step ${normalizeStatus(result.status_pengiriman) === "diproses" ? "active" : ""}`}>
                Diproses
              </div>

              <div className={`step ${
                ["dikirim","sampai"].includes(normalizeStatus(result.status_pengiriman))
                  ? "active"
                  : ""
              }`}>
                Dikirim
              </div>

              <div className={`step ${normalizeStatus(result.status_pengiriman) === "sampai" ? "active" : ""}`}>
                Sampai
              </div>
            </div>

            <table>
              <tbody>
                <tr><td>Tracking</td><td>{result.tracking_number || "-"}</td></tr>
                <tr><td>Surat Jalan</td><td>{result.nomor_surat_jalan || "-"}</td></tr>
                <tr><td>Tanggal</td><td>{result.tgl_surat_jalan || "-"}</td></tr>
                <tr><td>Berat</td><td>{result.berat || "-"}</td></tr>
                <tr><td>Pelanggan</td><td>{result.nama_pelanggan || "-"}</td></tr>
                <tr><td>Alamat</td><td>{result.alamat || "-"}</td></tr>
                <tr><td>No Telpon</td><td>{result.no_telpon || "-"}</td></tr>
                <tr><td>Barang</td><td>{result.nama_barang || "-"}</td></tr>
                <tr><td>Jumlah</td><td>{result.jumlah_barang || "-"}</td></tr>

                <tr>
                  <td>Status Pengiriman</td>
                  <td>{result.status_pengiriman || "-"}</td>
                </tr>

                <tr>
                  <td>Tanggal Tiba</td>
                  <td>
                    {result.tanggal_sampai
                      ? new Date(result.tanggal_sampai).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                </tr>

                <tr>
                  <td>Status Pembayaran</td>
                  <td
                    style={{
                      color:
                        result.status_pembayaran === "Lunas"
                          ? "green"
                          : result.status_pembayaran === "Belum Lunas"
                          ? "red"
                          : "black",
                      fontWeight: "bold",
                    }}
                  >
                    {result.status_pembayaran || "-"}
                  </td>
                </tr>

                <tr>
                  <td>Total Harga</td>
                  <td
                    style={{
                      color:
                        result.status_pembayaran === "Lunas"
                          ? "green"
                          : "black",
                      fontWeight: "bold",
                    }}
                  >
                    {formatRupiah(result.total_harga)}
                  </td>
                </tr>

              </tbody>
            </table>
          </>
        )}

      </div>
    </div>
  );
}