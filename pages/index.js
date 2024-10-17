import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMetadataExtraction = async (event) => {
    event.preventDefault();
    const imageUrl = event.target.imageUrl.value;
    const file = event.target.fileUpload.files[0];

    if (!imageUrl && !file) {
      setError('Please either enter a valid image URL or upload a file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        url = uploadData.url;
      } else {
        url = imageUrl;
      }

      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Error fetching metadata');
      }

      const data = await response.json();
      setMetadata(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Image Metadata Extractor</title>
        <meta name="description" content="Extract metadata from images" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Image Metadata Extractor</h1>
        <p className={styles.description}>Find and extract image metadata</p>

        <form onSubmit={handleMetadataExtraction} className={styles.form}>
          <input type="text" name="imageUrl" placeholder="Enter image URL" className={styles.input} />
          <input type="file" name="fileUpload" className={styles.input} />
          <button type="submit" className={styles.button}>Check metadata</button>
        </form>

        {loading && <p>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {metadata && (
          <div className={styles.metadata}>
            <h2>Metadata:</h2>
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
          </div>
        )}

        {/* FAQ section */}
        <div className={styles.faq}>
          <h2>Frequently Asked Questions</h2>
          {/* Add FAQ items here */}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Image Metadata Extractor. All rights reserved.</p>
        <a href="/terms">Terms of Use</a> | <a href="/privacy">Privacy Policy</a>
      </footer>
    </div>
  );
}
