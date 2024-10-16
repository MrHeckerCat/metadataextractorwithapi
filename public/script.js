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
async function requestMetadata(url) {
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
        if (!response.ok) {
            throw new Error('Error fetching metadata: ' + response.statusText);
        }
        const data = await response.json();
        displayMetadata(data);
    } catch (error) {
        console.error(error);
        displayError('An error occurred while fetching metadata. Please try again.');
    }
}

// Function to handle file upload
async function handleFileUpload(file) {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        displayError('Please upload an image file');
        return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
        displayError('File size must be less than 5MB');
        return;
    }

    try {
        // Create FormData object
        const formData = new FormData();
        formData.append('file', file);

        // First upload to Vercel blob storage
        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!uploadResponse.ok) {
            throw new Error('Error uploading file');
        }

        const { url } = await uploadResponse.json();
        
        // Now get metadata using the uploaded file URL
        await requestMetadata(url);
        
    } catch (error) {
        console.error('Upload error:', error);
        displayError('Failed to upload file. Please try again.');
    }
}

// Function to display metadata
function displayMetadata(metadata) {
    const metadataOutput = document.getElementById('metadataOutput');
    const copyButton = document.getElementById('copyMetadata');
    if (metadataOutput) {
        metadataOutput.innerHTML = '<pre>' + JSON.stringify(metadata, null, 2) + '</pre>';
        if (copyButton) {
            copyButton.style.display = 'block';
        }
    } else {
        console.error('Metadata output element not found');
    }
}

// Function to display error messages
function displayError(message) {
    const metadataOutput = document.getElementById('metadataOutput');
    const copyButton = document.getElementById('copyMetadata');
    if (metadataOutput) {
        metadataOutput.innerHTML = '<p style="color: red;">' + message + '</p>';
        if (copyButton) {
            copyButton.style.display = 'none';
        }
    } else {
        console.error('Metadata output element not found');
    }
}

// Main function to handle metadata extraction
function handleMetadataExtraction() {
    const imageUrlInput = document.getElementById('imageUrl');
    const fileInput = document.getElementById('fileUpload');

    if (fileInput && fileInput.files.length > 0) {
        handleFileUpload(fileInput.files[0]);
    } else if (imageUrlInput && imageUrlInput.value) {
        requestMetadata(imageUrlInput.value);
    } else {
        displayError('Please either enter a valid image URL or upload a file');
    }
}

// Function to copy metadata to clipboard
function copyMetadata() {
    const metadataOutput = document.getElementById('metadataOutput');
    if (metadataOutput) {
        const metadataText = metadataOutput.innerText;
        navigator.clipboard.writeText(metadataText).then(() => {
            alert('Metadata copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy metadata: ', err);
            alert('Failed to copy metadata. Please try again.');
        });
    } else {
        console.error('Metadata output element not found');
    }
}

// Function to handle drag and drop
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) {
            handleFileUpload(file);
        }
    }, false);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    toggleFAQ();
    setupDragAndDrop();

    // Setup metadata button
    const checkMetadataButton = document.getElementById('checkMetadata');
    if (checkMetadataButton) {
        checkMetadataButton.addEventListener('click', handleMetadataExtraction);
    } else {
        console.error('Check metadata button not found');
    }

    // Setup copy button
    const copyMetadataButton = document.getElementById('copyMetadata');
    if (copyMetadataButton) {
        copyMetadataButton.addEventListener('click', copyMetadata);
    } else {
        console.error('Copy metadata button not found');
    }

    // Setup file input change handler
    const fileInput = document.getElementById('fileUpload');
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                handleFileUpload(fileInput.files[0]);
            }
        });
    }

    // Setup mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            const isClickInsideMenu = navMenu.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);

            if (!isClickInsideMenu && !isClickOnToggle && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    }
});
