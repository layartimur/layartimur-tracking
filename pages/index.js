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
    .from("PENGIRIMAN") // ← UBAH DI SINI
    .select("*")
    .eq("tracking_number", tracking.trim())
    .single();

  if (error) {
    console.log(error);
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
          <p><strong>Nama:</strong> {result.customer_name}</p>
          <p><strong>Status:</strong> {result.status}</p>
          <p><strong>Tagihan:</strong> Rp {result.amount_due}</p>
          <p><strong>Pembayaran:</strong> {result.payment_status}</p>
        </div>
      )}
    </div>
  );
}
