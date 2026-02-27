import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Tracking() {

  const [resi, setResi] = useState("");
  const [last4, setLast4] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError("");
    setData(null);

    if (!resi || !last4) {
      setError("Nomor resi dan 4 digit terakhir HP wajib diisi");
      return;
    }

    if (last4.length !== 4) {
      setError("Masukkan tepat 4 digit terakhir nomor HP");
      return;
    }

    setLoading(true);

    const { data: result, error } = await supabase
      .from("PENGIRIMAN")
      .select("*")
      .eq("tracking_number", resi.trim())
      .single();

    setLoading(false);

    if (error || !result) {
      setError("Resi tidak ditemukan");
      return;
    }

    const hp = result.no_telpon || "";

    if (!hp.endsWith(last4)) {
      setError("4 digit terakhir nomor HP tidak sesuai");
      return;
    }

    setData(result);
  };

  return (
    <div className="heroPremium">

      <div className="heroCardPremium show">

        <img src="/logo.png" width="100" alt="Logo" />

        <h1 style={{ marginBottom: 30 }}>
          Tracking Layar Timur
        </h1>

        <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
          <input
            className="trackingInput"
            placeholder="Masukkan Nomor Resi"
            value={resi}
            onChange={(e)=>setResi(e.target.value)}
          />

          <input
            className="trackingInput"
            placeholder="4 Digit Terakhir No HP Penerima"
            maxLength={4}
            value={last4}
            onChange={(e)=>setLast4(e.target.value)}
          />

          <button
            className="btnPrimaryPremium"
            onClick={handleSearch}
          >
            {loading ? "Cek..." : "Cek"}
          </button>
        </div>

        {error && (
          <p style={{ color:"#f87171", marginTop:20 }}>
            {error}
          </p>
        )}

        {data && (
          <div style={{ marginTop:30, textAlign:"left" }}>
            <p><strong>Tracking:</strong> {data.tracking_number}</p>
            <p><strong>Nama:</strong> {data.nama_pelanggan}</p>
            <p><strong>Status:</strong> {data.status_pengiriman}</p>
            <p><strong>Status Pembayaran:</strong> {data.status_pembayaran}</p>
            <p><strong>Total Harga:</strong> Rp {Number(data.total_harga).toLocaleString()}</p>
          </div>
        )}

      </div>

    </div>
  );
}