async function fetchFiles(ts_url, map_url) {
    try {
        let ts_text = null;
        let map_data = null;

        if (map_url === null) {
            const [ts_res] = await Promise.all([
                fetch(ts_url)
            ])
        
            if (!ts_res.ok) {
                throw new Error("Timeseries data failed to fetch");
            }
        
            ts_text = await ts_res.text();        
        } else {
            // This fetches both timeseries data and map data
            const [ts_res, map_res] = await Promise.all([
                fetch(ts_url),
                fetch(map_url),
            ]);

            if (!ts_res.ok) {
                throw new Error("Timeseries data failed to fetch");
            }
            if (!map_res.ok) {
                throw new Error("Map data failed to fetch");
            }

            ts_text = await ts_res.text();
            map_json = await map_res.json();
        }
        return { ts_text, map_data };
    } catch (error) {
        console.error("Error fetching files:", error);
    }
}

function plot(ts_data, map_data) {
    let vizdiv = document.getElementById("vizdiv");

    vizdiv.innerHTML = "";

    if (ts_data) {
        let r = document.getElementById("vizdiv").getBoundingClientRect();

        let spec = {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            vconcat: [
                {
                    title: "Mean elevation change per Basin",
                    width: "container",
                    height: 200,
                    layer: [
                        {
                            data: {
                                values: ts_data, format:{
                                    type:"csv"
                                },
                            },
                            mark: "line",
                            encoding: {
                                x: {
                                    field: "midpoint",
                                    type: "temporal",
                                    title: "Time Period",
                                },
                                y: {
                                    field: "Smooth SEC",
                                    type: "quantitative",
                                    title: "Mean elevation change (m/year)",
                                },
                                opacity: {
                                    condition: {
                                        param: "click",
                                        value: 1,
                                    },
                                    value: 0.05,
                                },
                                color: {
                                    field: "Subregion",
                                    type: "nominal",
                                    legend: {
                                        title: "Basins",
                                        titleFontSize:14,
                                        labelFontSize: 14,
                                        symbolType: 'circle',
                                        symbolSize: 50,
                                    },
                                    scale: {
                                        "domain": [
                                            "All",
                                            "NE",
                                            "NO",
                                            "NW",
                                            "CE",
                                            "CW",
                                            "SE",
                                            "SW"
                                        ],
                                        "range": ["#00000", "#73fe6d", "#6ffff6", "#6b88fd", "#fffa6a", "#fe70fa", "#ff8d72", "#b17090"],
                                    }
                                },
                                tooltip: [
                                    { field: "Raw SEC" },
                                    { field: "period" },
                                    { field: "Subregion" },
                                ],
                            },
                            params: [
                                {
                                    name: "click",
                                    select: {
                                        type: "point",
                                        fields: ["Subregion"]
                                    },
                                    bind: "legend"
                                },
                            ],
                        },
                        {
                            data: {
                                values: [{ zero: 0.0 }],
                            },
                            mark: {
                                type: "rule",
                                color: "black",
                                strokeDash: [1],
                            },
                            encoding: {
                                y: {
                                    field: "zero",
                                    type: "quantitative",
                                },
                                size: { value: 1 },
                            },
                        },
                    ],
                },
                {
                    title: "Total elevation change since 1991 per basin",
                    width: "container",
                    height: 200,
                    layer: [
                        {                                    
                            data: {
                                values: ts_data, format:{
                                    type:"csv"
                                },
                            },
                            mark: "line",
                            encoding: {
                                x: {
                                    field: "midpoint",
                                    type: "temporal",
                                    title: "Time Period",
                                },
                                y: {
                                    field: "dH",
                                    type: "quantitative",
                                    title: "Total elevation change (m)",
                                },
                                opacity: {
                                    condition: {
                                        param: "click",
                                        value: 1,
                                    },
                                    value: 0.05,
                                },
                                color: {
                                    field: "Subregion",
                                    type: "nominal",
                                },
                                tooltip: [
                                    { field: "dH" },
                                    { field: "period" },
                                    { field: "Subregion" },
                                ],
                            },
                            params: [
                                {
                                    name: "click",
                                    select: {
                                        type: "point",
                                        fields: ["Subregion"]
                                    },
                                    bind: "legend"
                                },
                            ],
                        },
                        {
                            data: {
                                values: [{ zero: 0.0 }],
                            },
                            mark: {
                                type: "rule",
                                color: "black",
                                strokeDash: [1],
                            },
                            encoding: {
                                y: {
                                    field: "zero",
                                    type: "quantitative",
                                },
                                size: { value: 1 },
                            },
                        },
                    ],
                },
            ],
        };

        vegaEmbed(vizdiv, spec, {
            theme: "quartz",
            defaultStyle: false,
            actions: {
                export: true,
                source: false,
                compiled: false,
                editor: false,
            },
        }).catch(console.error);
        
        
    }
}

function main() {
    fetchFiles(
        "data/time_series_data_GrIS.csv",
        null
    ).then((data) => {
        if (data) {
            const { ts_text, map_json } = data;
            plot(ts_text, map_json);

            window.addEventListener("resize", (evt) => {
                plot(ts_text, map_json);
            });
        }
    });
}
