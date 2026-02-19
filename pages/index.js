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

  const handleCheck = async () => {
    setError("");
    setResult(null);

    const { data, error } = await supabase
      .from("PENGIRIMAN")
      .select("*")
      .eq("tracking_number", tracking.trim())
      .single();

    if (error) {
      setError("Nomor resi tidak ditemukan");
    } else {
      setResult(data);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Tracking Pengiriman</h1>

      <input
        type="text"
        placeholder="Masukkan Nomor Resi"
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
      />

      <button onClick={handleCheck}>Cek</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

           {result && (
        <div style={{ marginTop: 20 }}>
          <table border="1" cellPadding="8">
            <tbody>
              <tr>
                <td>Tracking Number</td>
                <td>{result.tracking_number}</td>
              </tr>
              <tr>
                <td>Nomor Surat Jalan</td>
                <td>{result.nomor_surat_jalan}</td>
              </tr>
              <tr>
                <td>Tanggal Surat Jalan</td>
                <td>{result.tgl_surat_jalan}</td>
              </tr>
              <tr>
                <td>Berat</td>
                <td>{result.berat}</td>
              </tr>
              <tr>
                <td>Nama Pelanggan</td>
                <td>{result.nama_pelanggan}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>{result.alamat}</td>
              </tr>
              <tr>
                <td>No Telpon</td>
                <td>{result.no_telpon}</td>
              </tr>
              <tr>
                <td>Nama Barang</td>
                <td>{result.nama_barang}</td>
              </tr>
              <tr>
                <td>Jumlah Barang</td>
                <td>{result.jumlah_barang}</td>
              </tr>
              <tr>
                <td>Status Pengiriman</td>
                <td>{result.status_pengiriman}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
