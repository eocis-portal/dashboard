var data = undefined;
var country_name = undefined;

function plot() {
    let vizdiv = document.getElementById("vizdiv");

    vizdiv.innerHTML = "";

    if (data) {

        let r = document.getElementById("vizdiv").getBoundingClientRect();
        let h = r.height;
        let w = r.width;

        let start_dt = document.getElementById("date_select_start").value;
        let end_dt = document.getElementById("date_select_end").value;
        // format YYYY-MM-DD

        let start_year = Number.parseInt(start_dt.slice(0,4));
        let start_month = Number.parseInt(start_dt.slice(5,7));
        let start_day = Number.parseInt(start_dt.slice(8,10));

        let end_year = Number.parseInt(end_dt.slice(0,4));
        let end_month = Number.parseInt(end_dt.slice(5,7));
        let end_day = Number.parseInt(end_dt.slice(8,10));

        console.log("height=" + h + ",width=" + w);

        let spec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "description": "A line plot.",
            "title": "Plant water stress - "+country_name,
            "data": {"format": {"type": "csv"}, "values": data},
            "mark": "line",
            "width": w,
            "height": h - 40,
            "padding": 20,
            "autosize": {
                "type": "fit",
                "contains": "padding"
            },
            "transform":[
                {"filter":
                    {"and": [{"field": "date", "gte": {"year":start_year, "month":start_month,"date":start_day}},
                            {"field": "date", "lte": {"year":end_year, "month":end_month,"date":end_day}}]}}
            ],
            "encoding": {
                "x": {"field": "date", "type": "temporal", "title": "Date"},
                "y": {
                    "field": "stress",
                    "type": "quantitative",
                    "scale": {"domain": [0, 1]},
                    "title": "Plant water stress"
                }
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

    let date_select_start = document.getElementById("date_select_start");
    date_select_start.addEventListener("change", (evt) => {
       plot();
    });
    let date_select_end = document.getElementById("date_select_end");
    date_select_end.addEventListener("change", (evt) => {
       plot();
    });

    const params = new URLSearchParams(window.location.search);
    let country = params.get("country");
    country_name = country;

    fetch("timeseries/"+country+".csv").then(r => r.text()).then(txt => {

        data = txt;

        plot();

        window.addEventListener("resize", (evt) => { plot(); });

    });

}