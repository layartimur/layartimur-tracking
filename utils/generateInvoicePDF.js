import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

/* ================= TERBILANG ================= */

function terbilang(n){

const angka=["","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh","sebelas"];

n=Math.floor(n);

if(n<12) return angka[n];
if(n<20) return terbilang(n-10)+" belas";
if(n<100) return terbilang(Math.floor(n/10))+" puluh "+terbilang(n%10);
if(n<200) return "seratus "+terbilang(n-100);
if(n<1000) return terbilang(Math.floor(n/100))+" ratus "+terbilang(n%100);
if(n<2000) return "seribu "+terbilang(n-1000);
if(n<1000000) return terbilang(Math.floor(n/1000))+" ribu "+terbilang(n%1000);
if(n<1000000000) return terbilang(Math.floor(n/1000000))+" juta "+terbilang(n%1000000);

return "";

}

/* ================= LOAD IMAGE ================= */

function loadImage(file){

try{

const filePath = path.join(process.cwd(),"public",file);
const base64 = fs.readFileSync(filePath).toString("base64");

return `data:image/png;base64,${base64}`;

}catch{

return null;

}

}

/* ================= MAIN ================= */

export async function generateInvoicePDF(invoice,items){
console.log("STATUS INVOICE:", invoice.status);
const shipment = invoice.shipments || {};

const doc = new jsPDF("p","mm","a4");

const margin = 15;
const pageWidth = 210;

/* ================= LOGO ================= */

const logo = loadImage("logosj.png");

if(logo){
doc.addImage(logo,"PNG",margin,15,30,30);
}

/* ================= HEADER ================= */

doc.setFont("helvetica","bold");
doc.setFontSize(16);
doc.text("LAYAR TIMUR",50,20);

doc.setFont("helvetica","normal");
doc.setFontSize(10);

doc.text("Jl. Teluk Bitung No.56 Perak Utara",50,26);
doc.text("Kec. Pabean Cantikan",50,31);
doc.text("Surabaya - Jawa Timur - 50612",50,36);
doc.text("Email : layartimur37@gmail.com",50,41);
doc.text("No. Telpon : 0859 7783 3502",50,46);

/* ================= HEADER KANAN ================= */

doc.setFont("helvetica","bold");
doc.setFontSize(16);
doc.text("INVOICE",pageWidth-margin,20,{align:"right"});

doc.setFont("helvetica","normal");
doc.setFontSize(11);

const tanggalInvoice = shipment.delivered_at
? new Date(shipment.delivered_at).toLocaleDateString("id-ID",{
day:"numeric",
month:"long",
year:"numeric"
})
: "-";

const invoiceNumber = shipment.sj_number
? `INVOICE-${shipment.sj_number.replace(/\//g,"")}`
: "-";

const labelX = pageWidth - margin - 55;
const colonX = labelX + 20;
const valueX = colonX + 4;

doc.text("Tgl Invoice",labelX,30);
doc.text(":",colonX,30);
doc.text(tanggalInvoice,valueX,30);

doc.text("No. Invoice",labelX,38);
doc.text(":",colonX,38);
doc.text(invoiceNumber,valueX,38);

/* ================= CUSTOMER ================= */

doc.setFont("helvetica","bold");
doc.text("KEPADA YTH.",margin,65);

doc.setFont("helvetica","normal");

doc.text(shipment.customer_name || "-",margin,72);
doc.text(`Alamat : ${shipment.address || "-"}`,margin,78);
doc.text(`Telp : ${shipment.phone || "-"}`,margin,84);

/* ================= TABLE ================= */

let y = 95;

doc.setFillColor(230,230,230);
doc.rect(margin,y,pageWidth-margin*2,10,"F");

doc.setFont("helvetica","bold");

doc.text("Deskripsi",margin+5,y+7);
doc.text("Berat (kg)",margin+90,y+7);
doc.text("Harga/kg",margin+120,y+7);
doc.text("Subtotal",pageWidth-margin,y+7,{align:"right"});

y += 10;

doc.setFont("helvetica","normal");

/* TOTAL VARIABLE */

let subtotalTotal = 0;
let insuranceTotal = 0;
let grandTotal = 0;

(items || []).forEach(item => {

const berat = Number(shipment.weight || 0);
const harga = Number(item.price || 0);

/* subtotal */

const subtotal = berat * harga;

/* asuransi */

const nominal = Number(item.item_value || 0);
const ins = item.insurance ? nominal * 0.002 : 0;

/* akumulasi total */

subtotalTotal += subtotal;
insuranceTotal += ins;
grandTotal += subtotal + ins;

/* render table */

doc.rect(margin,y,pageWidth-margin*2,10);

doc.text(item.name || "-",margin+5,y+7);
doc.text(String(berat),margin+95,y+7);
doc.text(`Rp ${harga.toLocaleString()}`,margin+120,y+7);

doc.text(
`Rp ${subtotal.toLocaleString()}`,
pageWidth-margin,
y+7,
{align:"right"}
);

y += 10;

});

/* ================= TOTAL ================= */

let totalY = y + 5;

doc.setFont("helvetica","bold");

doc.text("SUB TOTAL",pageWidth-margin-60,totalY);
doc.text(`Rp ${subtotalTotal.toLocaleString()}`,pageWidth-margin,totalY,{align:"right"});

totalY += 7;

doc.text("ASURANSI",pageWidth-margin-60,totalY);
doc.text(`Rp ${insuranceTotal.toLocaleString()}`,pageWidth-margin,totalY,{align:"right"});

totalY += 7;

doc.text("TOTAL TAGIHAN",pageWidth-margin-60,totalY);
doc.text(`Rp ${grandTotal.toLocaleString()}`,pageWidth-margin,totalY,{align:"right"});

/* ================= TERBILANG ================= */

let terbilangY = y + 8;

doc.setFont("helvetica","italic");
doc.text("Terbilang:",margin,terbilangY);

const totalText = (terbilang(grandTotal) + " rupiah").trim();

const lines = doc.splitTextToSize(totalText,120);

doc.text(lines,margin,terbilangY+7);

/* ================= PEMBAYARAN ================= */

let paymentY = terbilangY + 30;

doc.setFont("helvetica","bold");
doc.text("Pembayaran ditujukan kepada:",margin,paymentY);

doc.setFont("helvetica","normal");

doc.text("Bank",margin,paymentY+7);
doc.text(": BCA",margin+30,paymentY+7);

doc.text("A.n",margin,paymentY+14);
doc.text(": Gerardus Marianus Weru",margin+30,paymentY+14);

doc.text("No.Rek",margin,paymentY+21);
doc.text(": 3141599311",margin+30,paymentY+21);

/* ================= SIGNATURE ================= */

const signX = pageWidth - margin - 50;
const signY = paymentY + 10;

doc.text("Hormat kami,",signX,signY);

const ttd = loadImage("ttd.png");

if(ttd){
doc.addImage(ttd,"PNG",signX,signY+5,40,20);
}

const cap = loadImage("cap.png");

if(cap){
doc.addImage(cap,"PNG",signX+10,signY+5,30,30);
}

doc.text("Albertus Penti",signX,signY+35);

/* ================= WATERMARK PAID ================= */

if((invoice.status || "").toLowerCase() === "paid"){

doc.setFont("helvetica","bold");
doc.setFontSize(80);
doc.setTextColor(0,150,0);

doc.text(
"PAID",
105,
160,
{
align:"center",
angle:45
}
);

doc.setTextColor(0,0,0);

}

/* ================= RETURN ================= */

return Buffer.from(doc.output("arraybuffer"));

}