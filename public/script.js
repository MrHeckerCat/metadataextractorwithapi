$(document).ready(function () {
    $("#extractButton").on("click", function () {
        // Get the URL from the input field
        const imageUrl = $("#imageUrl").val();

        // Request the metadata from the API
        requestMetadata(imageUrl);
    });

    function requestMetadata(url) {
        const rapidApiKey = '06ffe64853msh9fbb527a0d94413p1b7f36jsnf81210f6b88a';
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

                // Parse the JSON
                return response.json();
            })
            .then((data) => {
                // Display the metadata in the output box
                $("#results pre").html(JSON.stringify(data, null, 4).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"));
            })
            .catch((error) => {
                console.error(error);
            });
    }
});
