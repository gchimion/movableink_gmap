// Constants
var CST_STORE_TAG = "store_id";
var CST_PARAMS_ERROR_NO_STORE = "Invalid id <br> no store with that id";
var CST_PARAMS_ERROR_INVALID_QUERY = "Invalid query - please specify<br> ?store_id= \< id \>";
var CST_PARAMS_STORE_ID_NOT_INTEGER = "Invalid id <br> id must be an integer";
var CST_PARAMS_STORE_ID_NO_PARAMETER = "Invalid query <br> no id has been entered";
var CST_PARAMS_PARAMETER_ZERO = "Invalid query <br> there is no store with id = 0";

var storeForBanner = new Object(); // Store being queried.
var strStoreId = "" // Url parameter.
var storeAddress = "";
var geocoder;
var map;

function geocodeInitalize() {

    var infowindow = new google.maps.InfoWindow({
        content: storeAddress
    });

    var mapOptions = {
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    geocoder = new google.maps.Geocoder();

    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    //geocoding of the store address
    geocoder.geocode({
        'address': storeAddress
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });

            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map, marker);
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });

}

// Returns the opening hour for a string containing the store hours.
function formatOpenHours(strHours) {
    var aPos = strHours.search("a");
    var pPos = strHours.search("p");
    var openHour = "";

    if (aPos < pPos) {
        openHour = strHours.substr(0, aPos) + "AM";
    } else {
        openHour = strHours.substr(0, pPos) + "PM";
    }
    return openHour;
}

//Based on the storeId (integer), triggers the banner build, or an error message.
function loadStoresData(indexStoreId) {
    $.get("data/store_addresses.csv", function(data) {
        var storeArray = $.csv.toArrays(data);

        if (storeArray[indexStoreId] == undefined) {
            if (strStoreId === undefined) paramsError(CST_PARAMS_ERROR_INVALID_QUERY);
            else if (strStoreId == "") paramsError(CST_PARAMS_STORE_ID_NO_PARAMETER); // No parameter has been entered.
            else paramsError(CST_PARAMS_ERROR_NO_STORE); // There is no store with this id. (id outside of the file)
        } else if (storeArray[indexStoreId][0] == "") paramsError(CST_PARAMS_ERROR_NO_STORE); // There is no store with this id. (blank value inside the csv file)
        else {
            storeForBanner.storeId = indexStoreId;
            storeForBanner.storeName = storeArray[indexStoreId][2];
            storeForBanner.city = storeArray[indexStoreId][4];
            storeForBanner.openThursday = (storeArray[indexStoreId][9] != "CLOSED"); // Tests if the store is closed on thursday.
            if (storeForBanner.openThursday) storeForBanner.openHours = formatOpenHours(storeArray[indexStoreId][9]);
            else storeForBanner.openHours = formatOpenHours(storeArray[indexStoreId][11]);

            storeAddress = storeArray[indexStoreId][3] + " " + storeArray[indexStoreId][4]

            geocodeInitalize();

            buildBanner();
        }
    });

}

// Populates the banner with the error message.
function paramsError(errorMessage) {
    $("#banner").html(errorMessage);
}

// Gets the parameter from the url and calls the loadStoresData function.
function startupBlock() {

    strStoreId = $.url().param(CST_STORE_TAG);
    var intStoreId = parseInt(strStoreId);

    if (strStoreId === undefined) paramsError(CST_PARAMS_ERROR_INVALID_QUERY);
    else if (!(strStoreId % 1 === 0)) paramsError(CST_PARAMS_STORE_ID_NOT_INTEGER);
    else if (intStoreId == 0) paramsError(CST_PARAMS_PARAMETER_ZERO);
    else {
        loadStoresData(intStoreId);
    };
}

// Populates the banner with the store information to display.
function buildBanner() {
    var strForBanner = "";

    strForBanner += storeForBanner.storeName;
    strForBanner += " <br>OPENS AT " + storeForBanner.openHours;
    strForBanner += " ON ";
    if (storeForBanner.openThursday) strForBanner += "THURSDAY";
    else strForBanner += "FRIDAY";

    $("#banner").html(strForBanner);
}