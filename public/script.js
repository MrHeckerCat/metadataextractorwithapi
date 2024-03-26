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
                .then((response) => response.json())
                .then((data) => {
                    if (response.ok) {
                        // Display the metadata in the output box
                        $("#results pre").html(JSON.stringify(data, null, 4).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"));
                    } else {
                        console.error(data.error);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching metadata:', error);
                });
        }
