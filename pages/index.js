import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMetadataExtraction = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMetadata(null);

    const imageUrl = event.target.imageUrl.value;
    const file = event.target.file.files[0];

    if (!imageUrl && !file) {
      setError('Please enter an image URL or select a file');
      setLoading(false);
      return;
    }

    try {
      let url;
      if (file) {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: file,
          headers: {
            'x-vercel-filename': file.name,
          },
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const blob = await uploadResponse.json();
        url = blob.url;
      } else {
        url = imageUrl;
      }

      const metadataResponse = await fetch('/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json();
        throw new Error(errorData.error || 'Failed to fetch metadata');
      }

      const metadataData = await metadataResponse.json();
      setMetadata(metadataData);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Image Metadata Extractor</title>
        <meta name="description" content="Extract metadata from images" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Image Metadata Extractor</h1>
        <p className={styles.description}>Find and extract image metadata</p>

        <form onSubmit={handleMetadataExtraction} className={styles.form}>
          <input
            type="text"
            name="imageUrl"
            placeholder="Enter image URL"
            className={styles.input}
          />
          <p className={styles.orText}>OR</p>
          <input type="file" name="file" className={styles.input} />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Processing...' : 'Check metadata'}
          </button>
        </form>

        {loading && <p>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {metadata && (
          <div className={styles.metadata}>
            <h2>Metadata:</h2>
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}
