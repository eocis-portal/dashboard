async function fetchFiles(ts1_url, ts2_url, map_url) {
    try {
        let ts1_text = null;
        let ts2_text = null;
        let map_data = null;

        if (map_url === null) {
            const [ts1_res, ts2_res] = await Promise.all([
                fetch(ts1_url),
                fetch(ts2_url),
            ])
        
            if (!ts1_res.ok) {
                throw new Error("Timeseries data 1 failed to fetch");
            }

            if (!ts2_res.ok) {
                throw new Error("Timeseries data 2 failed to fetch");
            }
        
            ts1_text = await ts1_res.text();        
            ts2_text = await ts2_res.text();
        } else {
            // This fetches both timeseries data and map data
            const [ts1_res, ts2_res, map_res] = await Promise.all([
                fetch(ts1_url),
                fetch(ts2_url),
                fetch(map_url),
            ]);

            if (!ts1_res.ok) {
                throw new Error("Timeseries data failed to fetch");
            }

            if (!ts2_res.ok) {
                throw new Error("Timeseries data 2 failed to fetch");
            }

            if (!map_res.ok) {
                throw new Error("Map data failed to fetch");
            }

            ts1_text = await ts1_res.text();
            ts2_text = await ts2_res.text();
            map_data = await map_res.json();
        }
        return { ts1_text, ts2_text, map_data };
    } catch (error) {
        console.error("Error fetching files:", error);
    }
}

function plot(dhdt_data, dh_data, map_data) {
    let vizdiv1 = document.getElementById("vizdiv1");
    let vizdiv2 = document.getElementById("vizdiv2");

    vizdiv1.innerHTML = "";
    vizdiv2.innerHTML = "";

    if (dhdt_data && dh_data) {
        let r = document.getElementById("vizdiv1").getBoundingClientRect();

        const spec1 = {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            title: "Elevation change rate per Basin",
            width: "container",
            height: 275,
            layer: [
                {
                    data: {
                        values: dhdt_data, format:{
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
                                domain: [
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
        };
        
        const spec2 = {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",

            title: "Elevation change since 1995 per basin",
            width: "container",
            height: 275,
            layer: [
                {                                    
                    data: {
                        values: dh_data, 
                        format:{
                            type:"csv"
                        },
                    },
                    mark: "line",
                    encoding: {
                        x: {
                            field: "dates",
                            type: "temporal",
                            title: "Time Period",
                        },
                        y: {
                            field: "Smooth dH",
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
                            field: "Basin",
                            type: "nominal",
                            legend: {
                                title: "Basins",
                                titleFontSize:14,
                                labelFontSize: 14,
                                symbolType: 'circle',
                                symbolSize: 50,
                            },
                            scale: {
                                domain: [
                                    "All",
                                    "NE",
                                    "NO",
                                    "NW",
                                    "CE",
                                    "CW",
                                    "SE",
                                    "SW"
                                ],
                                range: ["#00000", "#73fe6d", "#6ffff6", "#6b88fd", "#fffa6a", "#fe70fa", "#ff8d72", "#b17090"],
                            }
                        },
                        tooltip: [
                            { field: "mean dH" },
                            { field: "Dates" },
                            { field: "Basin" },
                        ],
                    },
                    params: [
                        {
                            name: "click",
                            select: {
                                type: "point",
                                fields: ["Basin"]
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
        };

        vegaEmbed(vizdiv1, spec1, {
            theme: "quartz",
            defaultStyle: false,
            actions: {
                export: false,
                source: false,
                compiled: false,
                editor: false,
            },
        }).catch((err) => {
            console.error("Failed to render chart 1:", err);
            return;
        });

        vegaEmbed(vizdiv2, spec2, {
            theme: "quartz",
            defaultStyle: false,
            actions: {
                export: false,
                source: false,
                compiled: false,
                editor: false,
            },
        }).catch((err) => {
            console.error("Failed to render chart 2:", err);
            return;
        });
        
        
    }
}

function main() {
    fetchFiles(
        "data/time_series_data_GrIS.csv",
        "data/timeseries_all_basins_elevation_GIS.csv",
        null
    ).then(({ ts1_text, ts2_text, map_data }) => {
        if (!ts1_text || !ts2_text) return;
        plot(ts1_text, ts2_text, map_data);

        window.addEventListener("resize", () => {
            plot(ts1_text, ts2_text, map_data);
        });
    });
}
