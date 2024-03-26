$(document).ready(function() {
    $('#extractButton').click(function() {
        const imageUrl = $('#imageUrl').val();

        const settings = {
            // ... (Your API settings as provided) ...
            url: 'https://metadata-extractor.p.rapidapi.com/?url=' + encodeURIComponent(imageUrl) 
        };

        $.ajax(settings).done(function (response) {
            // Clear previous results
            $('#results').empty(); 

            // Display results neatly
            for (const key in response) {
                $('#results').append(`<p><strong>${key}:</strong> ${response[key]}</p>`);
            }
        }).fail(function(error) {
            console.error("Error:", error);
            $('#results').text("An error occurred while fetching metadata."); 
        });
    });
});
