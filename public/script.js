// Function to toggle FAQ answers
function toggleFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            answer.style.display = answer.style.display === 'none' ? 'block' : 'none';
        });
    });
}

// Function to request metadata from the API
function requestMetadata(url) {
    const rapidApiKey = '4da17a7022msh495ad0a68eb0428p13ecb3jsn314cfa75b62c';
    const rapidApiHost = 'metadata-extractor.p.rapidapi.com';
    const settings = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': rapidApiHost,
        },
    };

    fetch(`https://metadata-extractor.p.rapidapi.com/?url=${encodeURIComponent(url)}`, settings)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error fetching metadata: ' + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            displayMetadata(data);
        })
        .catch((error) => {
            console.error(error);
            displayError('An error occurred while fetching metadata. Please try again.');
        });
}

// Function to display metadata
function displayMetadata(metadata) {
    const metadataOutput = document.getElementById('metadataOutput');
    if (metadataOutput) {
        metadataOutput.innerHTML = '<pre>' + JSON.stringify(metadata, null, 2) + '</pre>';
    } else {
        console.error('Metadata output element not found');
    }
}

// Function to display error messages
function displayError(message) {
    const metadataOutput = document.getElementById('metadataOutput');
    if (metadataOutput) {
        metadataOutput.innerHTML = '<p style="color: red;">' + message + '</p>';
    } else {
        console.error('Metadata output element not found');
    }
}

// Main function to handle metadata extraction
function handleMetadataExtraction() {
    const imageUrlInput = document.getElementById('imageUrl');
    if (imageUrlInput) {
        const imageUrl = imageUrlInput.value;
        if (imageUrl) {
            requestMetadata(imageUrl);
        } else {
            displayError('Please enter a valid image URL');
        }
    } else {
        console.error('Image URL input element not found');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    toggleFAQ();
    const checkMetadataButton = document.getElementById('checkMetadata');
    if (checkMetadataButton) {
        checkMetadataButton.addEventListener('click', handleMetadataExtraction);
    } else {
        console.error('Check metadata button not found');
    }
});
