async function extractMetadata(url) {
  const rapidApiKey = '06ffe64853msh9fbb527a0d94413p1b7f36jsnf81210f6b88a';
  const rapidApiHost = 'metadata-extractor.p.rapidapi.com';

  const settings = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': rapidApiHost,
    },
  };

  try {
    const response = await fetch(`https://metadata-extractor.p.rapidapi.com/?url=${encodeURIComponent(url)}`, settings);
    const data = await response.json();

    if (response.ok) {
      console.log(data);
    } else {
      console.error(data.error);
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }
}

// Example usage
extractMetadata('https://img.photographyblog.com/reviews/dji_mavic_air/photos/dji_mavic_air_06.jpg');
