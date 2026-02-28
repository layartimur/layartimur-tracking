import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Layar Timur Express</title>
        <meta
          name="description"
          content="Layanan pengiriman terpercaya dari Surabaya ke seluruh NTT dan Indonesia."
        />
        <link rel="icon" href="/logo.png" />
        <meta name="theme-color" content="#0f172a" />
      </Head>

      <Component {...pageProps} />
    </>
  )
}