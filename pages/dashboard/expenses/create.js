import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../utils/supabaseClient";

export default function CreateExpense() {
  const router = useRouter();
  const [shipments, setShipments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [activeKasbons, setActiveKasbons] = useState([]);
  const [selectedKasbons, setSelectedKasbons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  
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
    loadKasbons();
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

  const loadKasbons = async () => {
    const { data } = await supabase
      .from("expenses")
      .select("id, description, amount, created_at")
      .eq("category", "Kasbon")
      .eq("status", "Belum Lunas")
      .order("created_at", { ascending: false });
    setActiveKasbons(data || []);
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

  const handleKasbonCheck = (id) => {
    if (selectedKasbons.includes(id)) {
      setSelectedKasbons(selectedKasbons.filter(kId => kId !== id));
    } else {
      setSelectedKasbons([...selectedKasbons, id]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
    if (expenseType === "pelunasan" && selectedKasbons.length === 0) {
      alert("Minimal satu Kasbon Aktif wajib dipilih untuk dilunasi");
      return;
    }
    if (expenseType === "gaji" && !form.employee_id) {
      alert("Karyawan wajib dipilih untuk pengeluaran gaji");
      return;
    }

    setLoading(true);

    try {
      // 0. Upload file (jika ada)
      let attachmentUrl = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error("Gagal mengupload gambar: " + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        attachmentUrl = publicUrlData.publicUrl;
      }

      // 1. Simpan ke tabel Expenses
      let inserts = [];
      let finalAmount = Number(form.amount);

      // Hitung total potongan kasbon jika ada
      let kasbonDeduction = 0;
      if (selectedKasbons.length > 0) {
        kasbonDeduction = activeKasbons
          .filter(k => selectedKasbons.includes(k.id))
          .reduce((sum, k) => sum + Number(k.amount), 0);
      }

      if (expenseType === "pelunasan") {
        finalAmount = -Math.abs(Number(form.amount));
      } else if (expenseType === "gaji" && kasbonDeduction > 0) {
        finalAmount = Number(form.amount) - kasbonDeduction;
      }

      if (expenseType === "shipment") {
        const splitAmount = finalAmount / selectedShipments.length;
        inserts = selectedShipments.map(id => ({
          shipment_id: id,
          employee_id: null,
          description: form.description + (selectedShipments.length > 1 ? ` (Split ${selectedShipments.length} resi)` : ""),
          amount: splitAmount,
          category: form.category,
          attachment_url: attachmentUrl,
          status: expenseType === 'kasbon' ? 'Belum Lunas' : null,
          created_at: new Date(expenseDate).toISOString()
        }));
      } else {
        inserts = [{
          shipment_id: null,
          employee_id: expenseType === "gaji" ? form.employee_id : null,
          description: form.description + (kasbonDeduction > 0 ? ` (Potong Kasbon Rp ${kasbonDeduction.toLocaleString()})` : ""),
          amount: finalAmount,
          category: form.category,
          attachment_url: attachmentUrl,
          status: expenseType === 'kasbon' ? 'Belum Lunas' : null,
          created_at: new Date(expenseDate).toISOString()
        }];
      }

      const { error: expenseError } = await supabase
        .from("expenses")
        .insert(inserts);

      if (expenseError) throw expenseError;

      // Update status kasbon yang dipilih jadi Lunas
      if ((expenseType === "pelunasan" || expenseType === "gaji") && selectedKasbons.length > 0) {
        const { error: updateError } = await supabase
          .from("expenses")
          .update({ status: 'Lunas' })
          .in('id', selectedKasbons);
          
        if (updateError) throw updateError;
      }

      // 2. OTOMATISASI: Buat Draf Slip Gaji jika jenisnya Gaji
      if (expenseType === "gaji" && form.employee_id) {
        const dateObj = new Date(expenseDate);
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const currentPeriod = `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

        const { error: payrollError } = await supabase
          .from("payrolls")
          .insert([
            {
              employee_id: form.employee_id,
              period: currentPeriod,
              basic_salary: Number(form.amount),
              status: "Draft",
              created_at: new Date(expenseDate).toISOString()
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
        {/* TANGGAL TRANSAKSI */}
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Tanggal Transaksi (Bisa dimundurkan)</label>
        <input
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />

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
          <option value="kasbon">Kasbon / Pinjaman (Staf & Pihak Luar)</option>
          <option value="pelunasan">Pelunasan Kasbon Pihak Luar (Uang Masuk)</option>
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

        {/* PILIH KASBON (KHUSUS PELUNASAN / GAJI) */}
        {(expenseType === "pelunasan" || expenseType === "gaji") && (
          <>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>
               {expenseType === "gaji" ? "Potong Kasbon (Pilih kasbon jika ada)" : "Pilih Kasbon yang Dilunasi"}
            </label>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
              {activeKasbons.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#64748b' }}>Tidak ada kasbon aktif.</div>
              ) : activeKasbons.map(k => (
                <div key={k.id} style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      value={k.id} 
                      checked={selectedKasbons.includes(k.id)}
                      onChange={() => handleKasbonCheck(k.id)}
                      style={{ marginRight: '8px' }}
                    />
                    {k.description} (Rp {k.amount.toLocaleString()}) - {new Date(k.created_at).toLocaleDateString()}
                  </label>
                </div>
              ))}
            </div>
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
            <option value="Kasbon">Kasbon (Uang Keluar)</option>
            <option value="Pelunasan Kasbon">Pelunasan Kasbon (Uang Masuk)</option>
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

        {/* LAMPIRAN (BUKTI TRANSFER) */}
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Lampiran / Bukti Transfer (Opsional)</label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
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