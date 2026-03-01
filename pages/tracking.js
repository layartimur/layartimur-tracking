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
  const [items, setItems] = useState([]);
  const [totalUnit, setTotalUnit] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError("");
    setData(null);
    setItems([]);
    setTotalUnit(0);

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

    if (error || !result || result.length === 0) {
      setLoading(false);
      setError("Resi tidak ditemukan");
      return;
    }

    const shipment = result[0];

    const hp = shipment.phone || "";

    if (!hp.endsWith(last4)) {
      setLoading(false);
      setError("4 digit terakhir nomor HP tidak sesuai");
      return;
    }

    // 🔥 AMBIL ITEMS
    const { data: shipmentItems } = await supabase
      .from("shipment_items")
      .select("*")
      .eq("shipment_id", shipment.id);

    const totalQty = shipmentItems?.reduce(
      (sum, item) => sum + Number(item.qty || 0),
      0
    );

    setItems(shipmentItems || []);
    setTotalUnit(totalQty || 0);
    setData(shipment);
    setLoading(false);
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

            {/* 🔥 TOTAL UNIT BARU */}
            <p><strong>Jumlah Unit:</strong> {totalUnit} unit</p>

            {/* 🔥 DETAIL BARANG (OPTIONAL PREMIUM) */}
            {items.length > 0 && (
              <div style={{ marginTop:15 }}>
                <strong>Detail Barang:</strong>
                {items.map((item, index) => (
                  <div key={index}>
                    - {item.name} ({item.qty} {item.unit})
                  </div>
                ))}
              </div>
            )}

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

function TimelineItem({ active, title, date }) {
  return (
    <div style={{
      display:"flex",
      alignItems:"center",
      marginBottom:15,
      opacity: active ? 1 : 0.4
    }}>
      <div style={{
        width:12,
        height:12,
        borderRadius:"50%",
        background: active ? "#22c55e" : "#ccc",
        marginRight:10
      }} />
      <div>
        <strong>{title}</strong>
        {date && (
          <div style={{ fontSize:12 }}>
            {new Date(date).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}