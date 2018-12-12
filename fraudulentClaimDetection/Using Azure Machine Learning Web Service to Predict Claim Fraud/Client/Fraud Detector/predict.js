$(function () {

    var url = "<Copy Prediction URL Here>";
    var predictionKey = "<Copy API Key Here>";
    
    var fs = require("fs");
    var _ = require('underscore');

    var Converter = require('csvtojson');

    // Store the value of a selected image for display
    var fileData;
    var jsonBody;

    // Handle clicks of the Browse (...) button
    $("#select_button").click(function () {

        $('#analysisResults').html('');
        $('#analyze_button').prop('disabled', true);

        const electron = require('electron');
        const dialog = require('electron').dialog;

        var fileSelection = electron.remote.dialog.showOpenDialog();

        fileData = fs.readFileSync(fileSelection[0], { encoding : 'utf8'});

        Converter({
            noheader: false,
            delimiter: ","
        }).fromString(fileData).then((result) => {
            fs.writeFileSync("./logs/jsonResult.txt", JSON.stringify(result));

            $('#previewData').html('<p>Number of provided claims: ' + result.length + '</p>');

            jsonBody = JSON.parse(fs.readFileSync("./resources/jsonBody.json", {encoding: 'utf8'}));

            for(var item of result) {
                jsonBody.Inputs.input1.Values.push([
                    item.Month,
                    item.WeekOfMonth,
                    item.DayOfWeek,
                    item.Make,
                    item.AccidentArea,
                    item.DayOfWeekClaimed,
                    item.MonthClaimed,
                    item.WeekOfMonthClaimed,
                    item.Sex,
                    item.MaritalStatus,
                    item.Age,
                    item.Fault,
                    item.PolicyType,
                    item.VehicleCategory,
                    item.VehiclePrice,
                    item.PolicyNumber,
                    item.RepNumber,
                    item.Deductible,
                    item.DriverRating,
                    item.Days_Policy_Accident,
                    item.Days_Policy_Claim,
                    item.PastNumberOfClaims,
                    item.AgeOfVehicle,
                    item.AgeOfPolicyHolder,
                    item.PoliceReportFiled,
                    item.WitnessPresent,
                    item.AgentType,
                    item.NumberOfSuppliments,
                    item.AddressChange_Claim,
                    item.NumberOfCars,
                    item.Year,
                    item.BasePolicy
                ])
                console.log(JSON.stringify(item));
            }

            //fs.writeFileSync("./jsonBodyProcessed.txt", JSON.stringify(jsonBody));
        })        

        $('#analyze_button').prop('disabled', false);

    });

    // Handle clicks of the Analyze button
    $("#analyze_button").click(function () {

        fs.writeFileSync("./logs/finalJsonBody.txt", JSON.stringify(jsonBody));

        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(jsonBody),
            headers: {
                "Authorization": "Bearer " + predictionKey,
                "Content-Type": "application/json"
            }
        }).done(function (data) {
            fs.writeFileSync("./logs/serviceResponse.txt", JSON.stringify(data));

            predictionResults = data.Results.output1.value.Values;

            var htmlObject = '';
            var htmlHeader = '<table border=1><tr><th>Policy Number</th><th>Fraudulent?</th><th>Probability</th></tr>';

            htmlObject = htmlObject + htmlHeader;
            
            for (var item of predictionResults) {
                htmlObject = (item[1] == "1") ? htmlObject + '<tr class="fraud"><td>' + item[0] +'</td><td>Yes</td>' : htmlObject + '<tr class="nofraud"><td>' + item[0] + '</td><td>No</td>';
                htmlObject = htmlObject + '<td>' + (parseFloat(item[2])*100).toFixed(2) + ' %</td></tr>';
            }

            htmlObject = htmlObject + '</table>';

            $('#viewResults').html(htmlObject);

        }).fail(function (xhr, status, err) {
            //console.log("xhr: " + JSON.stringify(xhr));
            fs.writeFileSync("./logs/trace_log.txt", JSON.stringify(xhr));
            
            $('#viewResults').html("Prediction has failed, please try again! For further info, please consult the application log.");
        });

        $('#analyze_button').prop('disabled', true);
    });

});