async function fetchFiles(ts_url, map_url) {
    try {
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

        const ts_text = await ts_res.text();
        const map_json = await map_res.json();

        return { ts_text, map_json };
    } catch (error) {
        console.error("Error fetching files:", error);
    }
}

function plot(ts_data, map_data) {
    let vizdiv = document.getElementById("vizdiv");

    vizdiv.innerHTML = "";

    if (map_data && ts_data) {
        let r = document.getElementById("vizdiv").getBoundingClientRect();

        let spec = {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            hconcat: [
                {
                    vconcat: [
                        {
                            title: "Mean SEC per Basin",
                            width: 800,
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
                                                on: "click",
                                                clear: "mouseout",
                                            },
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
                            title: "Total Mean SEC since 1991 per basin",
                            width: 800,
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
                                                on: "click",
                                                clear: "mouseout",
                                            },
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
                },
                {
                    title: "Basin Map",
                    width: 500,
                    height: 500,
                    
                    data: {
                        values: map_data, format:{
                            type:"topojson",
                            feature:"data"
                        }
                    },
                    mark: "geoshape",
                    encoding: {
                        color: {
                            field: "properties.Subregion",
                            type: "nominal",
                            title: "Subregion"
                        },
                        opacity: {
                            condition: {
                                param: "click",
                                value: 1,
                            },
                            value: 0.2,
                        },
                        tooltip: [
                            { field: "properties.Subregion", type: "nominal" },
                            { field: "properties.Regions", type: "nominal" },
                        ],
                    },
                    projection: {
                        type: "stereographic",
                        center: [-90, -180],
                    },
                    params: [
                        {
                            name: "click",
                            select: {
                                type: "point",
                                on: "click",
                                clear: "mouseout",
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
        });
    }
}

function main() {
    const imageSelect = document.getElementById("imageSelect");
    const displayImage = document.getElementById("displayImage");

    fetchFiles(
        "processed_files/time_series_data_AIS.csv",
        "aux_files/ais_basins.json"
    ).then((data) => {
        if (data) {
            const { ts_text, map_json } = data;
            console.log(map_json);
            console.log(ts_text);
            plot(ts_text, map_json);

            window.addEventListener("resize", (evt) => {
                plot(ts_text, map_json);
            });
        }
    });
}
