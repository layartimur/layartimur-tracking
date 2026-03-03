import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

let jsPDF;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Invoices() {
  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from("invoices")
      .select(`
        *,
        shipments(
          id,
          tracking_number,
          customer_name,
          phone,
          address,
          sj_number,
          weight
        )
      `)
      .order("created_at", { ascending: false });

    setData(data || []);
  };

  const markAsPaid = async (id) => {
    setLoadingId(id);

    await supabase
      .from("invoices")
      .update({
        status: "Paid",
        paid_at: new Date()
      })
      .eq("id", id);

    loadData();
    setLoadingId(null);
  };

  const formatRupiah = (angka) => {
    const number = Number(angka) || 0;
    return "Rp " + number.toLocaleString("id-ID");
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    const exportData = data.map(item => ({
      Tracking: item.shipments?.tracking_number || "-",
      Customer: item.shipments?.customer_name || "-",
      "Total Tagihan": item.total || 0,
      Status: item.status || "-",
      "Tanggal Invoice": item.invoice_date
        ? new Date(item.invoice_date).toLocaleDateString("id-ID")
        : "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

    XLSX.writeFile(workbook, "Laporan_Invoice.xlsx");
  };

  const generateInvoicePDF = async (invoice) => {
    try {
      if (!jsPDF) {
        const module = await import("jspdf");
        jsPDF = module.default;
      }

      if (!invoice) return;

      const shipment = invoice.shipments || {};
      const berat = Number(shipment.weight) || 0;

      let invoiceNumber = invoice.invoice_number;

      if (!invoiceNumber) {
        const { data, error } =
          await supabase.rpc("generate_invoice_number");

        if (!error && data) {
          await supabase
            .from("invoices")
            .update({ invoice_number: data })
            .eq("id", invoice.id);

          invoiceNumber = data;
        }
      }

      const safeInvoiceNumber =
        typeof invoiceNumber === "string" && invoiceNumber.length > 0
          ? invoiceNumber
          : "INVOICE";

      const { data: items } = await supabase
        .from("shipment_items")
        .select("*")
        .eq("shipment_id", shipment.id);

      const doc = new jsPDF("p", "mm", "a4");
      const margin = 15;
      const pageWidth = 210;

      try {
        const logoBase64 = await fetch("/logosj.png")
          .then(res => res.blob())
          .then(blob =>
            new Promise(resolve => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })
          );

        doc.addImage(logoBase64, "PNG", margin, 15, 30, 30);
      } catch {}

      // HEADER
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("LAYAR TIMUR", 50, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Jl. Teluk Bitung No. 56 Perak Utara,", 50, 26);
      doc.text("Kec. Pabean Cantikan,", 50, 31);
      doc.text("Surabaya, Jawa Timur – 50612", 50, 36);
      doc.text("Email : layartimur37@gmail.com", 50, 41);
      doc.text("No. Telp : 0859 7783 3502", 50, 46);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("INVOICE", pageWidth - margin, 20, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      let rightY = 30;

      doc.text(
        `Tanggal Invoice : ${formatDateShort(invoice.invoice_date)}`,
        pageWidth - margin,
        rightY,
        { align: "right" }
      );

      rightY += 8;

      doc.text(
        `Invoice SJ      : ${shipment.sj_number || "-"}`,
        pageWidth - margin,
        rightY,
        { align: "right" }
      );

      doc.line(margin, 55, pageWidth - margin, 55);

      // CUSTOMER
      doc.setFont("helvetica", "bold");
      doc.text("Ditagihkan Kepada:", margin, 65);

      doc.setFont("helvetica", "normal");
      doc.text(shipment.customer_name || "-", margin, 72);
      doc.text(`Alamat : ${shipment.address || "-"}`, margin, 78);
      doc.text(`Telp : ${shipment.phone || "-"}`, margin, 84);

      // TABLE
      let y = 95;
      let grandTotal = 0;
      let insuranceTotal = 0;

      doc.setFillColor(230, 230, 230);
      doc.rect(margin, y, pageWidth - margin * 2, 10, "F");

      doc.setFont("helvetica", "bold");
      doc.text("Deskripsi", margin + 5, y + 7);
      doc.text("Berat (kg)", margin + 75, y + 7);
      doc.text("Harga /kg", margin + 100, y + 7);
      doc.text("Subtotal", margin + 150, y + 7);

      y += 10;
      doc.setFont("helvetica", "normal");

      (items || []).forEach((item) => {
        const hargaPerKg = Number(item.price) || 0;
        const subtotal = berat * hargaPerKg;
        const nominal = Number(item.item_value || item.nominal) || 0;
        const ins = item.insurance ? nominal * 0.002 : 0;

        grandTotal += subtotal + ins;
        insuranceTotal += ins;

        doc.rect(margin, y, pageWidth - margin * 2, 10);

        doc.text(item.name || "-", margin + 5, y + 7);
        doc.text(String(berat), margin + 80, y + 7);
        doc.text(`Rp ${hargaPerKg.toLocaleString()}`, margin + 100, y + 7);
        doc.text(
          `Rp ${subtotal.toLocaleString()}`,
          pageWidth - margin,
          y + 7,
          { align: "right" }
        );

        y += 10;
      });

      y += 10;

      doc.setFont("helvetica", "bold");
      doc.text(
        `Total Asuransi : Rp ${insuranceTotal.toLocaleString()}`,
        pageWidth - margin,
        y,
        { align: "right" }
      );

      y += 7;

      doc.text(
        `GRAND TOTAL : Rp ${grandTotal.toLocaleString()}`,
        pageWidth - margin,
        y,
        { align: "right" }
      );

      // TTD
      y += 20;
      const rightAreaX = pageWidth - margin - 60;
      let signY = y;

      doc.setFont("helvetica", "normal");
      doc.text("Hormat kami", rightAreaX, signY);

      try {
        const res = await fetch("/ttd.png");
        if (res.ok) {
          const blob = await res.blob();
          const ttdBase64 = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          doc.addImage(ttdBase64, "PNG", rightAreaX - 5, signY + 5, 50, 25);
        }
      } catch {}

      try {
        const res = await fetch("/cap.png");
        if (res.ok) {
          const blob = await res.blob();
          const capBase64 = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          doc.addImage(capBase64, "PNG", rightAreaX + 10, signY + 8, 35, 35);
        }
      } catch {}

      doc.text("Albertus Penti", rightAreaX, signY + 40);

      // PAYMENT
      y += 60;
      doc.setFont("helvetica", "bold");
      doc.text("Pembayaran ditujukan kepada:", margin, y);

      doc.setFont("helvetica", "normal");
      y += 7;
      doc.text("Bank : BCA", margin, y);
      y += 7;
      doc.text("A.n : Gerardus Marianus Weru", margin, y);
      y += 7;
      doc.text("No.Rek : 3141599311", margin, y);

      if (invoice.status === "Paid") {
        doc.setTextColor(0, 150, 0);
        doc.setFontSize(50);
        doc.text("PAID", 105, 160, {
          align: "center",
          angle: 30
        });
        doc.setTextColor(0, 0, 0);
      }

      doc.save(`${safeInvoiceNumber}.pdf`);
    } catch (err) {
      console.error("INVOICE PDF ERROR:", err);
      alert("Terjadi kesalahan saat membuat invoice");
    }
  };

  return (
    <div className="adminWrapper">
      <div className="adminContainer">
        <h1>Invoices</h1>

        <button
          onClick={exportToExcel}
          style={{
            marginBottom: "15px",
            padding: "8px 15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          Export Excel
        </button>

        <table>
          <thead>
            <tr>
              <th>Tracking</th>
              <th>Customer</th>
              <th>Total Tagihan</th>
              <th>Status</th>
              <th>PDF</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td>{item.shipments?.tracking_number}</td>
                <td>{item.shipments?.customer_name}</td>
                <td style={{ fontWeight: "bold" }}>
                  {formatRupiah(item.total)}
                </td>
                <td>{item.status}</td>
                <td>
                  <button onClick={() => generateInvoicePDF(item)}>
                    Download
                  </button>
                </td>
                <td>
                  {item.status === "Unpaid" && (
                    <button
                      onClick={() => markAsPaid(item.id)}
                      disabled={loadingId === item.id}
                    >
                      {loadingId === item.id
                        ? "Processing..."
                        : "Mark as Paid"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}