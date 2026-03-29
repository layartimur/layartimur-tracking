import { useState, useEffect } from "react";
import { useRouter } from "next/router";
// PERBAIKAN PATH: Mengarah tepat ke folder utils dari pages/dashboard/payroll/create/index.js
import { supabase } from "../../../../utils/supabaseClient";

export default function CreatePayroll() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employee_id: "",
    period: "",
    basic_salary: 0,
    meal_allowance: 0,
    transport_allowance: 0,
    ops_allowance: 0,
    bpjs: 0,
    pph21: 0,
    loan: 0,
  });

  useEffect(() => {
    fetchEmployees();
    // Set default period to current month
    const now = new Date();
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    setForm(prev => ({ ...prev, period: `${months[now.getMonth()]} ${now.getFullYear()}` }));
  }, []);

  const fetchEmployees = async () => {
    const { data } = await supabase.from("employees").select("id, name, position");
    setEmployees(data || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "employee_id" || name === "period" ? value : Number(value)
    });
  };

  const handleSubmit = async () => {
    if (!form.employee_id || !form.period) {
      alert("Karyawan dan Periode wajib diisi");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("payrolls").insert([form]);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert("Slip Gaji berhasil dibuat ✅");
    router.push("/dashboard/payroll");
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Buat Slip Gaji Baru</h1>
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-800 transition-colors">
          Kembali
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* DATA UTAMA */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-blue-700">Informasi Dasar</h2>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Pilih Karyawan</label>
            <select 
              name="employee_id" 
              value={form.employee_id} 
              onChange={handleChange}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">-- Pilih Karyawan --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Periode Gaji</label>
            <input 
              type="text" 
              name="period" 
              value={form.period} 
              onChange={handleChange}
              placeholder="Contoh: Maret 2026"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Gaji Pokok (Rp)</label>
            <input 
              type="number" 
              name="basic_salary" 
              value={form.basic_salary} 
              onChange={handleChange}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* TUNJANGAN */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-green-700">Tunjangan</h2>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tunj. Makan</label>
            <input type="number" name="meal_allowance" value={form.meal_allowance} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tunj. Transport</label>
            <input type="number" name="transport_allowance" value={form.transport_allowance} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tunj. Operasional</label>
            <input type="number" name="ops_allowance" value={form.ops_allowance} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        </div>

        {/* POTONGAN */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-red-700">Potongan</h2>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">BPJS</label>
            <input type="number" name="bpjs" value={form.bpjs} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">PPh21 (Pajak)</label>
            <input type="number" name="pph21" value={form.pph21} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Kasbon / Pinjaman</label>
            <input type="number" name="loan" value={form.loan} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        </div>

        {/* SUMMARY & SUBMIT */}
        <div className="flex flex-col justify-end">
          <div className="bg-slate-900 text-white p-6 rounded-2xl mb-4">
            <p className="text-xs uppercase font-bold opacity-60 mb-1">Total Take Home Pay</p>
            <p className="text-2xl font-black">
              Rp {(form.basic_salary + form.meal_allowance + form.transport_allowance + form.ops_allowance - (form.bpjs + form.pph21 + form.loan)).toLocaleString()}
            </p>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full py-4 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Simpan Slip Gaji"}
          </button>
        </div>
      </div>
    </div>
  );
}
