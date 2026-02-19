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
  <div style={{ marginTop: 30 }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
      border="1"
      cellPadding="10"
    >
      <tbody>
        <tr>
          <th align="left">Tracking Number</th>
          <td>{result.tracking_number}</td>
        </tr>
        <tr>
          <th align="left">Nomor Surat Jalan</th>
          <td>{result.nomor_surat_jalan}</td>
        </tr>
        <tr>
          <th align="left">Tanggal Surat Jalan</th>
          <td>{result.tgl_surat_jalan}</td>
        </tr>
        <tr>
          <th align="left">Berat</th>
          <td>{result.berat}</td>
        </tr>
        <tr>
          <th align="left">Nama Pelanggan</th>
          <td>{result.nama_pelanggan}</td>
        </tr>
        <tr>
          <th align="left">Alamat</th>
          <td>{result.alamat}</td>
        </tr>
        <tr>
          <th align="left">No Telpon</th>
          <td>{result.no_telpon}</td>
        </tr>
        <tr>
          <th align="left">Nama Barang</th>
          <td>{result.nama_barang}</td>
        </tr>
        <tr>
          <th align="left">Jumlah Barang</th>
          <td>{result.jumlah_barang}</td>
        </tr>
        <tr>
          <th align="left">Status Pengiriman</th>
          <td>{result.status_pengiriman}</td>
        </tr>
      </tbody>
    </table>
  </div>
);
}
