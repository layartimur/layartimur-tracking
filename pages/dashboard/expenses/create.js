import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../utils/supabaseClient";

export default function CreateExpense() {

  const router = useRouter();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 TAMBAHAN JENIS PENGELUARAN
  const [expenseType,setExpenseType] = useState("shipment");

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

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async () => {

    // VALIDASI
    if (!form.amount || !form.category) {
      alert("Amount dan Category wajib diisi");
      return;
    }

    if (expenseType === "shipment" && !form.shipment_id) {
      alert("Shipment wajib dipilih untuk pengeluaran shipment");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("expenses")
      .insert([
        {
          shipment_id:
            expenseType === "shipment"
              ? form.shipment_id
              : null,
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
          maxWidth: 400
        }}
      >

        {/* 🔥 JENIS PENGELUARAN BARU */}

        <select
          value={expenseType}
          onChange={(e)=>setExpenseType(e.target.value)}
        >

          <option value="shipment">
            Pengeluaran Shipment
          </option>

          <option value="gaji">
            Gaji
          </option>

          <option value="kasbon">
            Kasbon
          </option>
          <option value="transfer">
           Transfer ke Mr. Tomsan
           </option>

          <option value="lain">
            Lain-lain
          </option>

        </select>

        {/* SHIPMENT HANYA MUNCUL JIKA DIPILIH */}

        {expenseType === "shipment" && (

          <select
            name="shipment_id"
            value={form.shipment_id}
            onChange={handleChange}
          >

            <option value="">
              Pilih Shipment
            </option>

            {shipments.map(s => (

              <option key={s.id} value={s.id}>
                {s.tracking_number} - {s.customer_name}
              </option>

            ))}

          </select>

        )}

        {/* CATEGORY */}

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
        >

          <option value="">
            Pilih Kategori
          </option>

          {/* SHIPMENT */}
          <option value="BBM">
            BBM
          </option>

          <option value="Sopir">
            Sopir
          </option>

          <option value="Tol">
            Tol
          </option>

          <option value="Bongkar">
            Bongkar Muat
          </option>

          {/* GAJI */}
          <option value="Gaji PIC Surabaya">
            Gaji PIC Surabaya
          </option>

          <option value="Gaji PIC Kupang">
            Gaji PIC Kupang
          </option>

          <option value="Gaji Admin Surabaya">
            Gaji Admin Surabaya
          </option>

          <option value="Gaji Admin Kupang">
            Gaji Admin Kupang
          </option>

          {/* OPERASIONAL */}
          <option value="Kasbon">
            Kasbon
          </option>

          <option value="Admin">
            Admin
          </option>

          <option value="Operasional">
            Operasional
          </option>

	  <option value="Transfer Mr. Tomsan">
           Transfer ke Mr. Tomsan
           </option>

          <option value="Lainnya">
            Lainnya
          </option>

        </select>

        {/* DESCRIPTION */}

        <input
          type="text"
          name="description"
          placeholder="Keterangan (Solar, Toll, dll)"
          value={form.description}
          onChange={handleChange}
        />

        {/* AMOUNT */}

        <input
          type="number"
          name="amount"
          placeholder="Jumlah Pengeluaran"
          value={form.amount}
          onChange={handleChange}
        />

        {/* BUTTON */}

        <button
          onClick={handleSubmit}
          disabled={loading}
        >

          {loading
            ? "Menyimpan..."
            : "Simpan Pengeluaran"}

        </button>

        <button
          onClick={() => router.push("/dashboard")}
        >

          Kembali

        </button>

      </div>

    </div>

  );

}