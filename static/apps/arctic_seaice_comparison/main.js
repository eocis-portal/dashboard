var data = undefined;

function plot() {
    let vizdiv = document.getElementById("vizdiv");

    vizdiv.innerHTML = "";

    if (data) {

        let r = document.getElementById("vizdiv").getBoundingClientRect();
        let h = r.height;
        let w = r.width;


        console.log("height=" + h + ",width=" + w);

        let spec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "description": "A line plot.",
            "title": "Mean daily fraction of sea that is ice-covered above 60N",
            "data": {"format": {"type": "csv"}, "values": data},
            "mark": "line",
            "width": w,
            "height": h - 40,
            "padding": 20,
            "autosize": {
                "type": "fit",
                "contains": "padding"
            },
            "encoding": {
                "x": {"field": "doy", "type": "quantitative", "title": "Day of Year", "scale": {"domain": [1, 365]}, "axis": { "tickCount":12, "tickBand":"center"}},
                "y": {
                    "field": "sea_ice_fraction_arctic",
                    "type": "quantitative",
                    "scale": {"domain": [0, 1]},
                    "title": "Mean sea ice fraction"
                },
                "color": {
                    "field": "year", "type": "quantitative", "legend": {
                        "format": "r"
                    }
                },
                "tooltip": {"field": "year", "type": "quantitative"}
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


    fetch("sea_ice_fraction_arctic.csv").then(r => r.text()).then(txt => {

        data = txt;

        plot();

        window.addEventListener("resize", (evt) => { plot(); });

    });

}