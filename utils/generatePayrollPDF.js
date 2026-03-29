import { jsPDF } from "jspdf";

/* ================= TERBILANG ================= */
function terbilang(n) {
  const angka = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  n = Math.floor(n);
  if (n < 12) return angka[n];
  if (n < 20) return terbilang(n - 10) + " belas";
  if (n < 100) return terbilang(Math.floor(n / 10)) + " puluh " + terbilang(n % 10);
  if (n < 200) return "seratus " + terbilang(n - 100);
  if (n < 1000) return terbilang(Math.floor(n / 100)) + " ratus " + terbilang(n % 100);
  if (n < 2000) return "seribu " + terbilang(n - 1000);
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " ribu " + terbilang(n % 1000);
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " juta " + terbilang(n % 1000000);
  return "";
}

export async function generatePayrollPDF(employee, payroll) {
  const doc = new jsPDF("p", "mm", "a4");
  const margin = 20;
  const pageWidth = 210;

  /* ================= HEADER ================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("LAYAR TIMUR", margin, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Jl. Teluk Bitung No.56, Surabaya", margin, 31);
  doc.text("Email: layartimur37@gmail.com | Telp: 0859 7783 3502", margin, 36);

  doc.setLineWidth(0.5);
  doc.line(margin, 42, pageWidth - margin, 42);

  /* ================= TITLE ================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SLIP GAJI KARYAWAN", pageWidth / 2, 55, { align: "center" });
  doc.setFontSize(11);
  doc.text(`Periode: ${payroll.period || "-"}`, pageWidth / 2, 62, { align: "center" });

  /* ================= EMPLOYEE INFO ================= */
  let y = 75;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DATA KARYAWAN", margin, y);
  doc.setFont("helvetica", "normal");
  y += 7;
  doc.text("Nama", margin, y);
  doc.text(`: ${employee.name || "-"}`, margin + 35, y);
  y += 6;
  doc.text("Jabatan", margin, y);
  doc.text(`: ${employee.position || "-"}`, margin + 35, y);
  y += 6;
  doc.text("Status", margin, y);
  doc.text(`: ${employee.status || "Karyawan Tetap"}`, margin + 35, y);

  /* ================= INCOME & DEDUCTION ================= */
  y += 15;
  const colWidth = (pageWidth - margin * 2) / 2;

  // INCOME
  doc.setFont("helvetica", "bold");
  doc.text("PENDAPATAN", margin, y);
  doc.setFont("helvetica", "normal");
  y += 7;
  doc.text("Gaji Pokok", margin, y);
  doc.text(`Rp ${Number(payroll.basic_salary || 0).toLocaleString()}`, margin + colWidth - 5, y, { align: "right" });
  y += 6;
  doc.text("Tunj. Makan", margin, y);
  doc.text(`Rp ${Number(payroll.meal_allowance || 0).toLocaleString()}`, margin + colWidth - 5, y, { align: "right" });
  y += 6;
  doc.text("Tunj. Transport", margin, y);
  doc.text(`Rp ${Number(payroll.transport_allowance || 0).toLocaleString()}`, margin + colWidth - 5, y, { align: "right" });
  y += 6;
  doc.text("Tunj. Operasional", margin, y);
  doc.text(`Rp ${Number(payroll.ops_allowance || 0).toLocaleString()}`, margin + colWidth - 5, y, { align: "right" });

  const totalIncome = Number(payroll.basic_salary || 0) + Number(payroll.meal_allowance || 0) + Number(payroll.transport_allowance || 0) + Number(payroll.ops_allowance || 0);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Total Pendapatan", margin, y);
  doc.text(`Rp ${totalIncome.toLocaleString()}`, margin + colWidth - 5, y, { align: "right" });

  // DEDUCTION (Right Column)
  let yDed = 90;
  doc.setFont("helvetica", "bold");
  doc.text("POTONGAN", margin + colWidth + 5, yDed);
  doc.setFont("helvetica", "normal");
  yDed += 7;
  doc.text("BPJS Kesehatan", margin + colWidth + 5, yDed);
  doc.text(`Rp ${Number(payroll.bpjs || 0).toLocaleString()}`, pageWidth - margin, yDed, { align: "right" });
  yDed += 6;
  doc.text("PPh21 (Pajak)", margin + colWidth + 5, yDed);
  doc.text(`Rp ${Number(payroll.pph21 || 0).toLocaleString()}`, pageWidth - margin, yDed, { align: "right" });
  yDed += 6;
  doc.text("Kasbon / Pinjaman", margin + colWidth + 5, yDed);
  doc.text(`Rp ${Number(payroll.loan || 0).toLocaleString()}`, pageWidth - margin, yDed, { align: "right" });

  const totalDeduction = Number(payroll.bpjs || 0) + Number(payroll.pph21 || 0) + Number(payroll.loan || 0);
  yDed += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Total Potongan", margin + colWidth + 5, yDed);
  doc.text(`Rp ${totalDeduction.toLocaleString()}`, pageWidth - margin, yDed, { align: "right" });

  /* ================= NET SALARY ================= */
  const netSalary = totalIncome - totalDeduction;
  y = Math.max(y, yDed) + 20;
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y - 5, pageWidth - margin * 2, 15, "F");
  doc.setFontSize(12);
  doc.text("TOTAL GAJI BERSIH (Take Home Pay)", margin + 5, y + 4);
  doc.text(`Rp ${netSalary.toLocaleString()}`, pageWidth - margin - 5, y + 4, { align: "right" });

  /* ================= TERBILANG ================= */
  y += 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Terbilang:", margin, y);
  const totalText = (terbilang(netSalary) + " rupiah").trim();
  const lines = doc.splitTextToSize(totalText, 170);
  doc.text(lines, margin, y + 6);

  /* ================= SIGNATURE ================= */
  y += 40;
  const signX = pageWidth - margin - 50;
  doc.setFont("helvetica", "normal");
  doc.text(`Surabaya, ${new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}`, signX, y);
  y += 6;
  doc.text("Hormat kami,", signX, y);
  y += 25;
  doc.setFont("helvetica", "bold");
  doc.text("Admin HR", signX, y);

  return Buffer.from(doc.output("arraybuffer"));
}
