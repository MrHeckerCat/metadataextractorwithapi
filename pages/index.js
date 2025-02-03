import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [turnstileToken, setTurnstileToken] = useState(null);
  
  useEffect(() => {
    // Define the callback function in the window object
    window.onTurnstileSuccess = (token) => {
      setTurnstileToken(token);
    };

    // Load Turnstile script
    const script = document.createElement('script');
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window.onTurnstileSuccess;
    };
  }, []);

  const handleMetadataExtraction = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMetadata(null);

    if (!turnstileToken) {
      setError('Please complete the CAPTCHA verification');
      setLoading(false);
      return;
    }

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
        body: JSON.stringify({ 
          url,
          turnstileToken
        }),
      });

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json();
        throw new Error(errorData.error || 'Failed to fetch metadata');
      }

      const metadataData = await metadataResponse.json();
      setMetadata(metadataData);

      // Reset Turnstile after successful submission
      if (window.turnstile) {
        window.turnstile.reset();
      }
      setTurnstileToken(null);

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

  const copyMetadata = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2))
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setCopySuccess('Failed to copy');
      });
  };

  const faqItems = [
    {
      question: "How do I use this tool?",
      answer: "Enter the URL of an image in the input field and click \"Check metadata\" to extract the metadata. Alternatively, you can upload an image file directly."
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
    <div className={styles.container}>
      <Head>
        <title>Free Image Metadata Extractor</title>
        <meta name="description" content="Unlock the potential of your images with our advanced image data extractor web app. Easily extract text, metadata, and insights from images in seconds.Try it now for free!" />
        <link rel="icon" href="/favicon.svg" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-C1KENV7JHT"></script>
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
          
          {/* Turnstile CAPTCHA Widget */}
          <div
            id="turnstile-widget"
            className="cf-turnstile"
            data-sitekey="0x4AAAAAAA6sK4niXvHyELAG"
            data-callback="onTurnstileSuccess"
            data-theme="light"
          ></div>

          <button type="submit" className={styles.button} disabled={loading || !turnstileToken}>
            {loading ? 'Processing...' : 'Check metadata'}
          </button>
        </form>

        {loading && <p>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {metadata && (
          <div className={styles.metadata}>
            <h2>Metadata:</h2>
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
            <button onClick={copyMetadata} className={styles.copyButton}>
              {copySuccess || 'Copy Metadata'}
            </button>
          </div>
        )}

        <div className={styles.faq}>
          <h2>Frequently Asked Questions</h2>
          {faqItems.map((item, index) => (
            <div key={index} className={styles.faqItem}>
              <div 
                className={styles.faqQuestion} 
                onClick={() => toggleFaq(index)}
              >
                <h3>{item.question}</h3>
              </div>
              <div 
                className={`${styles.faqAnswer} ${openFaq === index ? styles.open : ''}`}
              >
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
