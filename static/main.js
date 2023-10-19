
function load() {
    const params = new URLSearchParams(location.search);
    if (params.has("app")) {
        show_app("apps/"+params.get("app")+"/index.html");
    }
}

function show_app(app_url) {
    const tile_view = document.getElementById("tile_view");
    const app_view = document.getElementById("app_view");
    const app_container = document.getElementById("app_container");
    app_container.src = app_url;
    app_view.style.display = "block";
    tile_view.style.display = "none";
}