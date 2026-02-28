import '../styles/globals.css'
import Head from 'next/head'
import { useState } from 'react'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

export default function App({ Component, pageProps }) {

  const [supabaseClient] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  )

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

      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <Component {...pageProps} />
      </SessionContextProvider>
    </>
  )
}