const { extractMetadata } = require('./pages/api/metadata.js');
const fetch = require('node-fetch');

async function testMetadataExtraction() {
    const startTime = Date.now();
    console.log('Test started at:', new Date().toISOString());

    try {
        // Test with a sample image URL
        const imageUrl = 'https://www.iptc.org/std-dev/photometadata/examples/google-licensable/images/IPTC-GoogleImgSrcPmd_testimg01.jpg';

        console.log('Fetching image...');
        const fetchStartTime = Date.now();
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log(`Image fetch completed in ${((Date.now() - fetchStartTime) / 1000).toFixed(2)}s`);

        console.log('Extracting metadata...');
        const extractStartTime = Date.now();
        const metadata = await extractMetadata(buffer, imageUrl);
        console.log(`Metadata extraction completed in ${((Date.now() - extractStartTime) / 1000).toFixed(2)}s`);

        console.log('Metadata extracted successfully:');
        console.log(JSON.stringify(metadata, null, 2));

        const totalTime = Date.now() - startTime;
        console.log(`\nTotal execution time: ${(totalTime / 1000).toFixed(2)}s`);
        process.exit(0);
    } catch (error) {
        console.error('Error during testing:', error);
        process.exit(1);
    }
}

// Run the test
testMetadataExtraction();