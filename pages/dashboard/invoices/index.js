import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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

  const generateInvoicePDF = async (invoice) => {
    try {
      if (!jsPDF) {
        const module = await import("jspdf");
        jsPDF = module.default;
      }

      if (!invoice) return;

      const shipment = invoice.shipments || {};
      const berat = Number(shipment.weight) > 0 ? Number(shipment.weight) : 1;

      // ===============================
      // GENERATE INVOICE NUMBER
      // ===============================
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

      // ===============================
      // LOAD ITEMS
      // ===============================
      const { data: items } = await supabase
        .from("shipment_items")
        .select("*")
        .eq("shipment_id", shipment.id);

      const doc = new jsPDF("p", "mm", "a4");
      const margin = 15;
      const pageWidth = 210;

      // ===============================
      // LOAD LOGO
      // ===============================
      try {
        const logoBase64 = await fetch("/logosj.png")
          .then(res => res.blob())
          .then(
            blob =>
              new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              })
          );

        doc.addImage(logoBase64, "PNG", margin, 15, 30, 30);
      } catch {}

      // ===============================
      // HEADER
      // ===============================
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

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(String(safeInvoiceNumber), pageWidth - margin, 30, {
        align: "right"
      });

      doc.text(
        `SJ : ${shipment.sj_number || "-"}`,
        pageWidth - margin,
        36,
        { align: "right" }
      );

      doc.line(margin, 55, pageWidth - margin, 55);

      // ===============================
      // CUSTOMER
      // ===============================
      doc.setFont("helvetica", "bold");
      doc.text("Ditagihkan Kepada:", margin, 65);

      doc.setFont("helvetica", "normal");
      doc.text(shipment.customer_name || "-", margin, 72);
      doc.text(`Alamat : ${shipment.address || "-"}`, margin, 78);
      doc.text(`Telp : ${shipment.phone || "-"}`, margin, 84);

      // ===============================
      // TABLE
      // ===============================
      let y = 95;
      let grandTotal = 0;
      let insuranceTotal = 0;

      doc.setFillColor(230, 230, 230);
      doc.rect(margin, y, pageWidth - margin * 2, 10, "F");

      doc.setFont("helvetica", "bold");
      doc.text("Deskripsi", margin + 5, y + 7);
      doc.text("Qty", margin + 85, y + 7);
      doc.text("Harga", margin + 105, y + 7);
      doc.text("Asuransi", margin + 135, y + 7);
      doc.text("Subtotal", margin + 165, y + 7);

      y += 10;
      doc.setFont("helvetica", "normal");

      (items || []).forEach((item) => {
        const hargaPerKg = Number(item.price) || 0;

        // SUBTOTAL = berat × harga
        const subtotal = berat * hargaPerKg;

        // ASURANSI = nominal × 0.2%
        const nominal = Number(item.item_value || item.nominal) || 0;
        const ins = item.insurance ? nominal * 0.002 : 0;

        const totalRow = subtotal + ins;

        grandTotal += totalRow;
        insuranceTotal += ins;

        const qtyDisplay =
          Number(item.qty) > 0 ? Number(item.qty) : 1;

        doc.rect(margin, y, pageWidth - margin * 2, 10);

        doc.text(item.name || "-", margin + 5, y + 7);
        doc.text(String(qtyDisplay), margin + 85, y + 7);
        doc.text(
          `Rp ${hargaPerKg.toLocaleString()}`,
          margin + 105,
          y + 7
        );
        doc.text(
          ins > 0 ? `Rp ${ins.toLocaleString()}` : "-",
          margin + 135,
          y + 7
        );
        doc.text(
          `Rp ${totalRow.toLocaleString()}`,
          margin + 165,
          y + 7
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

      // ===============================
      // PAYMENT
      // ===============================
      y += 20;

      doc.setFont("helvetica", "bold");
      doc.text("Pembayaran ditujukan kepada:", margin, y);

      doc.setFont("helvetica", "normal");
      y += 7;
      doc.text("Bank : BCA", margin, y);
      y += 7;
      doc.text("A.n : Gerardus Marianus Weru", margin, y);
      y += 7;
      doc.text("No.Rek : 3141599311", margin, y);

      // ===============================
      // WATERMARK
      // ===============================
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

        <table>
          <thead>
            <tr>
              <th>Tracking</th>
              <th>Customer</th>
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