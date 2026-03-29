import { createClient } from "@supabase/supabase-js";
import { generatePayrollPDF } from "../../utils/generatePayrollPDF";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const { employeeId, period } = req.query;

    if (!employeeId || !period) {
      return res.status(400).send("Employee ID and Period are required");
    }

    /* 1. Ambil data Karyawan */
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("*")
      .eq("id", employeeId)
      .single();

    if (empError || !employee) {
      return res.status(404).send("Data karyawan tidak ditemukan");
    }

    /* 2. Ambil data Payroll untuk periode tersebut */
    const { data: payroll, error: payError } = await supabase
      .from("payrolls")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("period", period)
      .single();

    if (payError || !payroll) {
      return res.status(404).send("Data payroll periode ini belum dibuat");
    }

    /* 3. Generate PDF Buffer */
    const pdfBuffer = await generatePayrollPDF(employee, payroll);

    /* 4. Kirim ke Browser */
    const safeName = employee.name.replace(/\s+/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SLIP_GAJI_${safeName}_${period}.pdf`
    );
    res.send(pdfBuffer);

  } catch (err) {
    console.error("PAYROLL API ERROR:", err);
    res.status(500).send("Gagal membuat Slip Gaji PDF");
  }
}
