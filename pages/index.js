import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

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

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: "How do I use this tool?",
      answer: "Enter the URL of an image in the input field and click \"Check metadata\" to extract the metadata."
    },
    {
      question: "What type of metadata can I find?",
      answer: "You can find information such as image size, creation date, camera settings, and more, depending on the image."
    },
    {
      question: "Is it possible to extract metadata from any image?",
      answer: "Most digital images contain some form of metadata, but the amount and type of information can vary depending on the image source and format."
    }
  ];

  return (
    <div className={styles.pageWrapper}>
      <Head>
        <title>Free Image Metadata Extractor</title>
        <meta name="description" content="Unlock the potential of your images with our advanced image data extractor web app. Easily extract text, metadata, and insights from images in seconds. Try it now for free!" />
        <link rel="icon" type="image/svg+xml" href="favicon.svg" />
      </Head>

      <main className={styles.scrollableContent}>
        <h1 className={styles.title}>Image Metadata Extractor</h1>
        <p className={styles.description}>Find and extract image metadata</p>

        <form onSubmit={handleMetadataExtraction} className={styles.form}>
          <input
            type="text"
            name="imageUrl"
            placeholder="Enter image URL"
            className={styles.input}
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Processing...' : 'Check metadata'}
          </button>
        </form>

        <div className={styles.dropZone} id="dropZone">
          <p>Drag and drop an image here or</p>
          <input type="file" name="file" accept="image/*" className={styles.fileInput} />
        </div>

        {loading && <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
        </div>}
        {error && <p className={styles.error}>{error}</p>}
        {metadata && (
          <div className={styles.metadataOutput}>
            <h2>Metadata:</h2>
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
            <button className={styles.copyButton} onClick={() => navigator.clipboard.writeText(JSON.stringify(metadata, null, 2))}>
              Copy Metadata
            </button>
          </div>
        )}

        <p className={styles.infoText}>
          Reveal data that is stored in your files, such as size, date of the last change, and the applications that were involved in the creation process.
        </p>

        <div className={styles.faq}>
          <h2>Frequently Asked Questions</h2>
          {faqItems.map((item, index) => (
            <div key={index} className={styles.faqItem}>
              <div className={styles.faqQuestion} onClick={() => toggleFaq(index)}>
                <h3>{item.question}</h3>
              </div>
              <div className={`${styles.faqAnswer} ${openFaq === index ? styles.open : ''}`}>
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
