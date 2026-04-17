import '../styles/globals.css'
import Head from 'next/head'
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Activa el Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#131313" />
        <link rel="apple-touch-icon" href="https://i.postimg.cc/1XfP6k97/37730-removebg-preview.png" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
