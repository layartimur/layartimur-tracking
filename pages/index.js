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
          <p><b>Tracking Number:</b> {result.tracking_number}</p>
          <p><b>Nomor Surat Jalan:</b> {result.nomor_surat_jalan}</p>
          <p><b>Tanggal Surat Jalan:</b> {result.tgl_surat_jalan}</p>
          <p><b>Berat:</b> {result.berat}</p>
          <p><b>Nama Pelanggan:</b> {result.nama_pelanggan}</p>
          <p><b>Alamat:</b> {result.alamat}</p>
          <p><b>No Telpon:</b> {result.no_telpon}</p>
          <p><b>Nama Barang:</b> {result.nama_barang}</p>
          <p><b>Jumlah Barang:</b> {result.jumlah_barang}</p>
          <p><b>Status Pengiriman:</b> {result.status_pengiriman}</p>
        </div>
      )}
    </div>
  );
}
