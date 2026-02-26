import Link from "next/link";

export default function Tentang() {
  return (
    <div className="aboutPageWrapper">

      <div className="aboutPageContainer">

        <h1>Layar Timur Jastip (LT Jastip)</h1>

        <p>
          Layar Timur Jastip (LT Jastip) adalah layanan jasa titip pengiriman
          barang yang hadir untuk membantu masyarakat Nusa Tenggara Timur (NTT)
          mendapatkan akses pengiriman yang lebih mudah, aman, dan terpercaya.
        </p>

        <p>
          Kami fokus pada layanan penitipan dan pengiriman barang dari berbagai
          kota ke wilayah NTT dengan proses yang rapi, cepat, dan transparan.
        </p>

        <p>
          Kami memahami bahwa pengiriman barang bukan hanya soal memindahkan
          paket dari satu tempat ke tempat lain, tetapi juga soal menjaga
          kepercayaan. Karena itu, setiap barang yang dititipkan kepada kami
          ditangani dengan penuh tanggung jawab, mulai dari proses penerimaan,
          pengecekan, pengemasan, hingga barang sampai ke tujuan.
        </p>

        <p>
          Dengan sistem kerja yang profesional, komunikasi yang terbuka, dan
          update yang jelas kepada pelanggan, LT Jastip berkomitmen memberikan
          rasa aman dalam setiap proses pengiriman.
        </p>

        <hr style={{ margin: "40px 0", opacity: 0.3 }} />

        {/* VISI MISI */}
        <div className="aboutPageGrid">

          <div className="aboutBox">
            <h3>🎯 Visi</h3>
            <p>
              Menjadi jasa titip pengiriman barang pilihan utama masyarakat
              Nusa Tenggara Timur.
            </p>
          </div>

          <div className="aboutBox">
            <h3>🚀 Misi</h3>
            <p>
              Memberikan layanan pengiriman yang cepat, transparan, dan
              terpercaya dengan pelayanan yang responsif dan profesional.
            </p>
          </div>

          <div className="aboutBox">
            <h3>💬 Motto</h3>
            <p><strong>Mengantar Kepercayaan.</strong></p>
          </div>

          <div className="aboutBox">
            <h3>🛡 Komitmen Kami</h3>
            <p>
              Aman Dititip, Sampai dengan Pasti.
            </p>
          </div>

        </div>

        <Link href="/">
          <button className="aboutBackBtn">
            ← Kembali ke Beranda
          </button>
        </Link>

      </div>

    </div>
  );
}