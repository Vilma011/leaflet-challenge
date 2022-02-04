// create tile layers for the background of the map
var satelliteMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//grayscale layer
var grayScale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

//USGS_USImagery layer
let USGS_USImagery = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 20,
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});

//OpenTopoMap layer
var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// make base maps
let basemaps = {
    Defalt: satelliteMap,
    Grayscale: grayScale,
    "Open Topo Map": OpenTopoMap,
    "USGS US Imagery": USGS_USImagery
};

// make a map object
var myMap = L.map("map", {
    center: [38.8026, -116.4194],
    zoom: 3,
    layers: [satelliteMap, grayScale, OpenTopoMap, USGS_USImagery]

});

//add satellite map to the map
satelliteMap.addTo(myMap);
//grayScale.addTo(myMap);

// get the data for the tectonic plates and then draw on the maps
// variable to hold the tectonic plate layer
let tectonicplates = new L.layerGroup();

// call the api to get the info for the tectonic plates
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
    //Console log to make sure the data loads
    //console.log(plateData)

    //load the data using geoJson and add to the tectonic plates layer group
    L.geoJson(plateData,{
        // add style so that we can see lines
        color:"gold",
        weight: 1
    }).addTo(tectonicplates);
});

// add tectonic plates to map
tectonicplates.addTo(myMap);


// variable to hold the earthquake layer data
let earthquakes = new L.layerGroup();

//get the data for the earthquakes and populate the layer group
// call the USGS geoJson api
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
    function(earthquakeData){
        //Console log to make sure the data loads
        //console.log(earthquakeData)
        // plot circles where the radius is dependant on the magnitude and the color is dependant on the depth

        // make a function that chooses the color of the data point
        function dataColor(depth){
            //console.log(typeof depth);

            if (depth > 90)
                return "red";
            else if (depth > 70)
                return "#fc4903";
            else if (depth > 50)
                return "#fc8403";
            else if (depth > 30)
                return "#fcad03";
            else if (depth > 10)
                return "#cafc03";
            else
                return "green";

        }

        //make a function to determine the size of the radius
        function radiusSize(mag){
            if (mag == 0)
                return 1; // makes sure a 0 mag earthquake shows up
            else 
                return mag * 5; //make sure the circle is pronounced in the map
        }

        // add on to the style for each data point
        function dataStyle(feature){
            return {
                opacity: 5,
                fillOpacity: 0.5,
                fillColor: dataColor(feature.geometry.coordinates[2]), //use index 2 for the depth
                color: "000000",//black outline
                radius: radiusSize(feature.properties.mag), //grabs the magnitude
                weight: 0.5,
                stroke: true
            }
        }
        //add the geoJson data to the earthquake layer group
        L.geoJson(earthquakeData, {
            // make each feature a marker that is on the map, each marker is a circle
            pointToLayer: function(feature, latLng){
                return L.circleMarker(latLng);
            },
            //set the style for each marker
            style: dataStyle, //calls the data style function and pass in earthquake data
            //add popups
            onEachFeature: function(feature, layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                                Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                                Location: <b>${feature.properties.place}</b>`);

            }
        }).addTo(earthquakes);
    }
 
);

   // add the earthquake layer to the map
   earthquakes.addTo(myMap);
//add the overlay for the tectonic plates and for the earthquakes
let overlays = {
    "Tectonic Plates": tectonicplates,
    "Earthquake Data": earthquakes
};

//add layer control
L.control
    .layers(basemaps, overlays)
    .addTo(myMap);

//add the legend to the map
let legend = L.control({
    position: "bottomright"
});

//add the properties for the legend
legend.onAdd = function(){
    //div for a legend to appear in the page
    let div = L.DomUtil.create("div", "info legend");

    //set up the intervals
    let intervals =  [-10,10,30,50,70,90];
    //set colors
    let colors = ["green", "#cafc03", "#fcad03", "#fc8403", "#fc4903", "red"];

    //loop through the intervals and the colors and generate labels with colored square for each interval

    for (var i = 0; i< intervals.length; i++)
    {
        //inner html that sets the square for each interval and label
        div.innerHTML += "<i style= 'background:"
            + colors[i]
            + "'></i>"
            + intervals[i] 
            + (intervals[i+1]? "km - " + intervals[i+1] + "km<br>" : "+");
    }

    return div;
};

//add the legend to the map
legend.addTo(myMap);













































































































