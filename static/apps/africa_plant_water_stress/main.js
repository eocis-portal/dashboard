var data = undefined;
var metadata = undefined;

function plot() {
    let vizdiv = document.getElementById("vizdiv");

    vizdiv.innerHTML = "";

    if (data) {

        let r = document.getElementById("vizdiv").getBoundingClientRect();
        let h = r.height;
        let w = r.width;

        let dt = document.getElementById("date_select").value;
        // format YYYY-MM-DD

        let year = dt.slice(0,4);
        let month = dt.slice(5,7);
        let day = dt.slice(8,10);

        let data_url = "data/csv/"+year+"/"+month+"/stress"+year+month+day+".csv";

        console.log("height=" + h + ",width=" + w);

        let spec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "description": "Chloropleth plot of plant water stress",
            "title": "Plant Water Stress - Mean values by country - "+dt,
            "data": {"format": {"property": "features"}, "values": data},
            "mark": {"type":"geoshape","tooltip":true},
            "width": w,
            "height": h - 40,
            "padding": 20,
            "autosize": {
                "type": "fit",
                "contains": "padding"
            },
            "projection": {
                "type": "mercator"
            },
            "transform": [{
                "lookup": "properties.adm0_a3",
                "from": {
                  "data": {
                    "url": data_url
                  },
                  "key": "country",
                  "fields": ["stress","country"]
                }
              }, {
                "lookup": "properties.adm0_a3",
                "from": {
                  "data": {
                    "url": data_url
                  },
                  "key": "country",
                  "fields": ["stress","country"]
                }
              },
            {
                "calculate": "'timeseries.html?country=' + datum.country",
                "as": "url"
            }],
           "encoding": {
                "color": {
                  "field": "stress",
                  "type": "quantitative"
                },
               "href" : {
                    "field": "url"
               },
               "tooltip": [
                      {"field": "country", "type": "nominal"},
                      {"field": "stress", "type": "quantitative", "format": ".2f"}
                    ]
            }
        }

        vegaEmbed(vizdiv, spec, {
            "theme": "quartz",
            "defaultStyle": false,
            "actions": {"export": true, "source": false, "compiled": false, "editor": false}
        });
    }
}

function main() {

    fetch("data/metadata.json").then(r => r.text()).then( txt => {
       metadata = JSON.parse(txt);
       let date_select = document.getElementById("date_select");
       date_select.setAttribute("min",metadata.start_date);
       date_select.setAttribute("max",metadata.end_date);
       date_select.setAttribute("value",metadata.end_date);
       date_select.addEventListener("change", (evt) => {
          refresh();
       });

       refresh();
    });
}

function refresh() {
    fetch("africa-outline-with-countries_6.geojson").then(r => r.text()).then(txt => {

        data = txt;

        plot();

        window.addEventListener("resize", (evt) => { plot(); });

    });

}

