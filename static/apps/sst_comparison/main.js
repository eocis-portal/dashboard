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
            "title": "Mean Daily Sea Surface Temperatures between 60S and 60N",
            "data": {"format": {"type": "csv"}, "values": data},
            "width": w,
            "height": h - 40,
            "padding": 20,
            "autosize": {
                "type": "fit",
                "contains": "padding"
            },
            "layer": [{
                "transform": [
                    {
                        "filter": "datum.year >= 2023"
                    },
                    {
                        "calculate": "substring(toString(datum.year),0,4)",
                        "as": "year"
                    }
                ],
                "mark": "line",
                "encoding": {
                    "x": {
                        "field": "doy",
                        "type": "quantitative",
                        "title": "Day of Year",
                        "scale": {"domain": [1, 365]},
                        "axis": {"tickCount": 12, "tickBand": "center"}
                    },
                    "y": {
                        "field": "analysed_sst",
                        "type": "quantitative",
                        "scale": {"domain": [19.5, 21.5]},
                        "title": "Mean Sea Surface Temperature (Centigrade)"
                    },
                    "color": {
                        "field": "year",
                        "type": "nominal",
                        "scale": {"domain": ["2023"], "range": ["#F1C40F"]},
                        "legend": {
                            "type": "symbol",
                            "symbolFillColor": "#F1C40F"
                        }
                    },
                    "tooltip": {"field": "year", "type": "nominal"}
                }
            }, {
                "transform": [
                    {
                        "filter": "datum.year < 2023"
                    }
                ],
                "mark": "line",
                "encoding": {
                    "x": {
                        "field": "doy",
                        "type": "quantitative",
                        "title": "Day of Year",
                        "scale": {"domain": [1, 365]},
                        "axis": {"tickCount": 12, "tickBand": "center"}
                    },
                    "y": {
                        "field": "analysed_sst",
                        "type": "quantitative",
                        "scale": {"domain": [19.5, 21.5]},
                        "title": "Mean Sea Surface Temperature (Centigrade)"
                    },
                     "color": {
                        "field": "year", "type": "quantitative", "legend": {
                            "format": "r",
                             "type": "gradient"
                        }
                    },
                    "tooltip": {"field": "year", "type": "quantitative"}
                }
            }]
        }

        vegaEmbed(vizdiv, spec, {
            "theme": "quartz",
            "defaultStyle": false,
            "actions": {"export": true, "source": false, "compiled": false, "editor": false}
        });
    }
}

function main() {


    fetch("globmeansst.csv").then(r => r.text()).then(txt => {

        data = txt;

        plot();

        window.addEventListener("resize", (evt) => { plot(); });

    });

}