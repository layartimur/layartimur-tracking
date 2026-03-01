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

    const cleanResi = resi.trim().toUpperCase();

    const { data: result, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("tracking_number", cleanResi);

    setLoading(false);

    if (error || !result || result.length === 0) {
      setError("Resi tidak ditemukan");
      return;
    }

    const shipment = result[0];

    const hp = shipment.phone || "";

    if (!hp.endsWith(last4)) {
      setError("4 digit terakhir nomor HP tidak sesuai");
      return;
    }

    setData(shipment);
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
            onChange={(e)=>setResi(e.target.value.toUpperCase())}
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
            <p><strong>Nama:</strong> {data.customer_name}</p>
            <p><strong>Status:</strong> {data.status}</p>
            <p><strong>Berat:</strong> {data.weight} kg</p>

            <div style={{ marginTop:30 }}>
              <h3>Progress Pengiriman</h3>

              <TimelineItem
                active={true}
                title="Diproses"
                date={data.created_at}
              />

              <TimelineItem
                active={data.status === "Dikirim" || data.status === "Sampai"}
                title="Dikirim"
                date={data.shipped_at}
              />

              <TimelineItem
                active={data.status === "Sampai"}
                title="Sampai Tujuan"
                date={data.delivered_at}
              />

            </div>
          </div>
        )}

      </div>

    </div>
  );
}


// ================================
// TIMELINE COMPONENT (DI LUAR RETURN)
// ================================
function TimelineItem({ active, title, date }) {
  return (
    <div style={{
      display:"flex",
      alignItems:"center",
      marginBottom:15,
      opacity: active ? 1 : 0.4
    }}>
      <div style={{
        width:14,
        height:14,
        borderRadius:"50%",
        background: active ? "#22c55e" : "#d1d5db",
        marginRight:12
      }} />
      <div>
        <strong>{title}</strong>
        {date && (
          <div style={{ fontSize:12, color:"#6b7280" }}>
            {new Date(date).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}