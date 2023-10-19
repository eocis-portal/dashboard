
var country_code_lookup = {};

function display_table(o) {
    country_code_lookup = o.country_code_lookup;
    const grid = new gridjs.Grid({
      columns: o.columns,
      sort:true,
      data: o.data
    }).render(document.getElementById("wrapper"));
}



function load_table() {
    fetch("data/anomalies.json")
        .then(f => f.json())
        .then(o => display_table(o));

    var gibs = L.tileLayer.wms('https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi', {
        layers: 'BlueMarble_NextGeneration',
        format: 'image/png',
        attribution: '<a href="https://earthdata.nasa.gov/earth-observation-data">NASA EOSDIS GIBS</a>'
    });

    var osm = L.tileLayer( 'http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });


    var bounds = [[min_lat, min_lon], [max_lat,max_lon]];

    map = L.map('map', {
         maxBounds: bounds,
         maxBoundsViscosity: 0.5,
         layers: [gibs],
         center: [0,0],
         zoom: 2,
         minZoom: 2,
         crs: L.CRS.EPSG3857
    });

    L.control.layers({
        "OSM": osm,
        "NASA": gibs
    }).addTo(map);

}
