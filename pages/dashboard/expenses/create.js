import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../utils/supabaseClient";

export default function CreateExpense() {
  const router = useRouter();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    shipment_id: "",
    description: "",
    amount: "",
    category: ""
  });

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    const { data } = await supabase
      .from("shipments")
      .select("id, tracking_number, customer_name")
      .order("created_at", { ascending: false });

    setShipments(data || []);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.shipment_id || !form.amount || !form.category) {
      alert("Shipment, Amount, dan Category wajib diisi");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("expenses")
      .insert([
        {
          shipment_id: form.shipment_id,
          description: form.description,
          amount: Number(form.amount),
          category: form.category
        }
      ]);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert("Pengeluaran berhasil ditambahkan ✅");
    router.push("/dashboard");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Input Pengeluaran</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 15, maxWidth: 400 }}>

        <select name="shipment_id" value={form.shipment_id} onChange={handleChange}>
          <option value="">Pilih Shipment</option>
          {shipments.map(s => (
            <option key={s.id} value={s.id}>
              {s.tracking_number} - {s.customer_name}
            </option>
          ))}
        </select>

        {/* 🔥 CATEGORY BARU */}
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Pilih Kategori</option>
          <option value="BBM">BBM</option>
          <option value="Sopir">Sopir</option>
          <option value="Tol">Tol</option>
          <option value="Bongkar">Bongkar Muat</option>
          <option value="Admin">Admin</option>
          <option value="Operasional">Operasional</option>
          <option value="Lainnya">Lainnya</option>
        </select>

        <input
          type="text"
          name="description"
          placeholder="Keterangan (Solar, Toll, dll)"
          value={form.description}
          onChange={handleChange}
        />

        <input
          type="number"
          name="amount"
          placeholder="Jumlah Pengeluaran"
          value={form.amount}
          onChange={handleChange}
        />

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
        </button>

        <button onClick={() => router.push("/dashboard")}>
          Kembali
        </button>
      </div>
    </div>
  );
}