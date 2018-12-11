$(function () {

    // Replace <Custom Vision Prediction URI> with your valid Prediction URI for Custom Vision.
    const predictionUri = 'https://southcentralus.api.cognitive.microsoft.com/customvision/v2.0/Prediction/fb551518-31ed-4046-a70b-a1489c001a60/image';
    // Replace <Prediction Key> with your valid prediction key.
    const predictionKey = 'c925cd22272c4d52b7436f30f90754d6';
    

    
    var fs = require('fs');
    var _ = require('underscore');

    // Store the value of a selected image for display
    var imageBytes;

    // Handle clicks of the Browse (...) button
    $("#select_button").click(function () {

        $('#analysisResults').html('');
        $('#analyze_button').prop('disabled', true);

        const electron = require('electron');
        const dialog = require('electron').dialog;

        var va = electron.remote.dialog.showOpenDialog();

        var contents = fs.readFileSync(va[0], "base64");
        imageBytes = fs.readFileSync(va[0]);

        $('#previewImage').html('<img width="240" src="data:image/png;base64,' + contents + '" />');
        $('#analyze_button').prop('disabled', false);

    });

    // Handle clicks of the Analyze button
    $("#analyze_button").click(function () {

        $.ajax({
            type: "POST",
            url: predictionUri,
            data: imageBytes,
            processData: false,
            headers: {
                "Prediction-Key": predictionKey,
                "Content-Type": "multipart/form-data"
            }
        }).done(function (data) {

            var predictions = data.predictions;
            var sortedPredictions = _.sortBy(predictions, 'probability').reverse();
            var bestPrediction = sortedPredictions[0];

            if (bestPrediction.probability > .35) {
                $('#analysisResults').html('<div class="matchLabel">' + bestPrediction.tagName + ' (' + (bestPrediction.probability * 100).toFixed(0) + '%)' + '</div>');
            }
            else {
                $('#analysisResults').html('<div class="noMatchLabel">Unknown</div>');
            }

        }).fail(function (xhr, status, err) {
            alert(err);
        });

        $('#analyze_button').prop('disabled', true);
    });

});


