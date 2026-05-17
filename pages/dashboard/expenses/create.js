import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../utils/supabaseClient";

export default function CreateExpense() {
  const router = useRouter();
  const [shipments, setShipments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // JENIS PENGELUARAN
  const [expenseType, setExpenseType] = useState("shipment");
  const [form, setForm] = useState({
    shipment_id: "",
    employee_id: "",
    description: "",
    amount: "",
    category: ""
  });

  useEffect(() => {
    loadShipments();
    loadEmployees();
  }, []);

  const loadShipments = async () => {
    const { data } = await supabase
      .from("shipments")
      .select("id, tracking_number, customer_name")
      .order("created_at", { ascending: false });
    setShipments(data || []);
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from("employees")
      .select("id, name, position")
      .order("name", { ascending: true });
    setEmployees(data || []);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleShipmentCheck = (id) => {
    if (selectedShipments.includes(id)) {
      setSelectedShipments(selectedShipments.filter(sId => sId !== id));
    } else {
      setSelectedShipments([...selectedShipments, id]);
    }
  };

  const handleSubmit = async () => {
    // VALIDASI
    if (!form.amount || !form.category) {
      alert("Jumlah dan Kategori wajib diisi");
      return;
    }
    if (expenseType === "shipment" && selectedShipments.length === 0) {
      alert("Minimal satu Shipment wajib dipilih");
      return;
    }
    if (expenseType === "gaji" && !form.employee_id) {
      alert("Karyawan wajib dipilih untuk pengeluaran gaji");
      return;
    }

    setLoading(true);

    try {
      // 1. Simpan ke tabel Expenses
      let inserts = [];
      if (expenseType === "shipment") {
        const splitAmount = Number(form.amount) / selectedShipments.length;
        inserts = selectedShipments.map(id => ({
          shipment_id: id,
          employee_id: null,
          description: form.description + (selectedShipments.length > 1 ? ` (Split ${selectedShipments.length} resi)` : ""),
          amount: splitAmount,
          category: form.category
        }));
      } else {
        inserts = [{
          shipment_id: null,
          employee_id: expenseType === "gaji" ? form.employee_id : null,
          description: form.description,
          amount: Number(form.amount),
          category: form.category
        }];
      }

      const { error: expenseError } = await supabase
        .from("expenses")
        .insert(inserts);

      if (expenseError) throw expenseError;

      // 2. OTOMATISASI: Buat Draf Slip Gaji jika jenisnya Gaji
      if (expenseType === "gaji" && form.employee_id) {
        const now = new Date();
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const currentPeriod = `${months[now.getMonth()]} ${now.getFullYear()}`;

        const { error: payrollError } = await supabase
          .from("payrolls")
          .insert([
            {
              employee_id: form.employee_id,
              period: currentPeriod,
              basic_salary: Number(form.amount),
              status: "Draft"
            }
          ]);
        
        if (payrollError) {
          console.error("Gagal membuat draf payroll:", payrollError.message);
        }
      }

      alert("Pengeluaran berhasil disimpan ✅" + (expenseType === "gaji" ? " (Draf Slip Gaji Otomatis Dibuat)" : ""));
      router.push("/dashboard");

    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Input Pengeluaran Baru</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
          maxWidth: 450
        }}
      >
        {/* JENIS PENGELUARAN */}
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Klasifikasi Pengeluaran</label>
        <select
          value={expenseType}
          onChange={(e) => setExpenseType(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="shipment">Operasional Shipment</option>
          <option value="gaji">Gaji Karyawan (Otomatisasi)</option>
          <option value="aset">Pembelian Aset</option>
          <option value="sewa">Sewa Mobil</option>
          <option value="kasbon">Kasbon / Pinjaman Staf</option>
          <option value="transfer">Transfer ke Mr. Tomsan</option>
          <option value="lain">Lain-lain</option>
        </select>

        {/* PILIH SHIPMENT (KHUSUS SHIPMENT) */}
        {expenseType === "shipment" && (
          <>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Pilih Shipment (Bisa lebih dari 1)</label>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
              {shipments.map(s => (
                <div key={s.id} style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      value={s.id} 
                      checked={selectedShipments.includes(s.id)}
                      onChange={() => handleShipmentCheck(s.id)}
                      style={{ marginRight: '8px' }}
                    />
                    {s.tracking_number} - {s.customer_name}
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PILIH KARYAWAN (KHUSUS GAJI - TRIGGER OTOMATISASI) */}
        {expenseType === "gaji" && (
          <>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#2563eb' }}>Pilih Karyawan (Akan Membuat Slip Gaji)</label>
            <select
              name="employee_id"
              value={form.employee_id}
              onChange={handleChange}
              style={{ padding: '10px', borderRadius: '6px', border: '2px solid #2563eb', backgroundColor: '#eff6ff' }}
            >
              <option value="">-- Pilih Nama Karyawan --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
              ))}
            </select>
          </>
        )}

        {/* KATEGORI */}
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Kategori Akuntansi</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="">-- Pilih Kategori --</option>
          
          {/* SHIPMENT */}
          {expenseType === "shipment" && (
            <optgroup label="Logistik & Operasional">
              <option value="BBM">BBM (Solar/Bensin)</option>
              <option value="Sopir">Uang Sopir</option>
              <option value="Tol">Biaya Tol</option>
              <option value="Bongkar">Bongkar Muat</option>
              <option value="Sewa Mobil">Sewa Mobil</option>
            </optgroup>
          )}

          {/* GAJI */}
          {expenseType === "gaji" && (
            <optgroup label="Beban Personalia">
              <option value="Gaji PIC Surabaya">Gaji PIC Surabaya</option>
              <option value="Gaji PIC Kupang">Gaji PIC Kupang</option>
              <option value="Gaji Admin Surabaya">Gaji Admin Surabaya</option>
              <option value="Gaji Finance & Admin Layar Timur">Gaji Finance & Admin Layar Timur</option>
            </optgroup>
          )}

          {/* ASSETS */}
          {expenseType === "aset" && (
            <optgroup label="Investasi Aset">
              <option value="DP Mobil">DP Mobil</option>
              <option value="Angsuran Mobil">Angsuran Mobil</option>
              <option value="Pembelian Motor">Pembelian Motor</option>
              <option value="Pembelian Komputer">Pembelian Komputer</option>
              <option value="Pembelian Printer">Pembelian Printer</option>
              <option value="Aset Lainnya">Aset Lainnya</option>
            </optgroup>
          )}

           {/* SEWA MOBIL */}
           {expenseType === "sewa" && (
           <optgroup label="Biaya Sewa Kendaraan">
           <option value="Sewa Mobil Harian">Sewa Mobil Harian</option>
           <option value="Sewa Mobil Bulanan">Sewa Mobil Bulanan</option>
           <option value="Sewa Mobil Tahunan">Sewa Mobil Tahunan</option>
           <option value="Sewa Driver">Sewa Driver</option>
           </optgroup>
           )}

          {/* UMUM */}
          <optgroup label="Umum & Lainnya">
            <option value="Kasbon">Kasbon</option>
            <option value="Admin">Biaya Admin Kantor</option>
            <option value="Operasional">Operasional Umum</option>
            <option value="Transfer Mr. Tomsan">Transfer ke Mr. Tomsan</option>
            <option value="Lainnya">Lain-lain</option>
          </optgroup>
        </select>

        {/* KETERANGAN */}
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Keterangan</label>
        <input
          type="text"
          name="description"
          placeholder="Contoh: Pembelian Solar SJ-001"
          value={form.description}
          onChange={handleChange}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />

        {/* JUMLAH */}
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Jumlah (Rp)</label>
        <input
          type="number"
          name="amount"
          placeholder="0"
          value={form.amount}
          onChange={handleChange}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />

        {/* BUTTONS */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ 
            padding: '12px', 
            backgroundColor: '#1e293b', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
        </button>
        
        <button
          onClick={() => router.push("/dashboard")}
          style={{ 
            padding: '12px', 
            backgroundColor: '#f1f5f9', 
            color: '#475569',
            border: '1px solid #e2e8f0', 
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}