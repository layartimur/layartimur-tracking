import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Meta Responsive */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Basic SEO */}
        <title>Layar Timur Express</title>
        <meta name="description" content="Layanan pengiriman terpercaya dari Surabaya ke seluruh NTT dan Indonesia." />

        {/* Favicon (pastikan ada di public/) */}
        <link rel="icon" href="/logo.png" />

        {/* Theme Color Mobile */}
        <meta name="theme-color" content="#0f172a" />
      </Head>

      <Component {...pageProps} />
    </>
  )
}