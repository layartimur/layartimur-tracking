import '../styles/globals.css'
import Head from 'next/head'
import { useState } from 'react'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default function App({ Component, pageProps }) {

  // 🔐 Supabase session client
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient()
  )

  return (
    <>
      <Head>
        {/* Meta Responsive */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Basic SEO */}
        <title>Layar Timur Express</title>
        <meta
          name="description"
          content="Layanan pengiriman terpercaya dari Surabaya ke seluruh NTT dan Indonesia."
        />

        {/* Favicon */}
        <link rel="icon" href="/logo.png" />

        {/* Theme Color */}
        <meta name="theme-color" content="#0f172a" />
      </Head>

      {/* 🔐 SESSION PROVIDER (WAJIB UNTUK RLS) */}
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <Component {...pageProps} />
      </SessionContextProvider>
    </>
  )
}