import { useState, useEffect } from "react";
import { useRouter } from "next/router";
// FIXED PATH: Moving up 3 levels to reach utils/ from pages/dashboard/payroll/index.js
import { supabase } from "../../../utils/supabaseClient";

export default function PayrollList() {
  const router = useRouter();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    setLoading(true);
    // Join with employees table to get name and position
    const { data, error } = await supabase
      .from("payrolls")
      .select(`
        *,
        employees (
          name,
          position
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching payrolls:", error.message);
    } else {
      setPayrolls(data || []);
    }
    setLoading(false);
  };

  const handleDownloadPDF = (employeeId, period) => {
    window.open(`/api/payroll-pdf?employeeId=${employeeId}&period=${period}`, "_blank");
  };

  return (
    <div className="p-10 max-w-6xl mx-auto font-sans bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daftar Slip Gaji</h1>
          <p className="text-slate-500 mt-1">Manajemen riwayat penggajian karyawan.</p>
        </div>
        <button 
          onClick={() => router.push("/dashboard/payroll/create")}
          className="bg-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-700/20"
        >
          <span className="material-icons text-sm">add</span>
          Buat Slip Gaji Baru
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Memuat data...</div>
      ) : payrolls.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-20 text-center">
          <p className="text-slate-400 font-medium">Belum ada data slip gaji.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs uppercase font-black tracking-widest text-slate-400">Karyawan</th>
                <th className="px-6 py-4 text-xs uppercase font-black tracking-widest text-slate-400">Periode</th>
                <th className="px-6 py-4 text-xs uppercase font-black tracking-widest text-slate-400">Take Home Pay</th>
                <th className="px-6 py-4 text-xs uppercase font-black tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs uppercase font-black tracking-widest text-slate-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrolls.map((pay) => {
                const totalIncome = Number(pay.basic_salary || 0) + Number(pay.meal_allowance || 0) + Number(pay.transport_allowance || 0) + Number(pay.ops_allowance || 0);
                const totalDeduction = Number(pay.bpjs || 0) + Number(pay.pph21 || 0) + Number(pay.loan || 0);
                const netSalary = totalIncome - totalDeduction;

                return (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900">{pay.employees?.name || "-"}</p>
                      <p className="text-xs text-slate-400 font-medium tracking-tight uppercase">{pay.employees?.position || "-"}</p>
                    </td>
                    <td className="px-6 py-5 text-slate-600 font-medium">{pay.period}</td>
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-900">Rp {netSalary.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleDownloadPDF(pay.employee_id, pay.period)}
                        className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-all"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={() => router.push("/dashboard")} className="mt-8 text-slate-400 hover:text-slate-800 font-bold flex items-center gap-2 transition-colors">
        <span className="material-icons text-sm">arrow_back</span>
        Kembali ke Dashboard
      </button>
    </div>
  );
}
