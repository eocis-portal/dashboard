import matplotlib.pyplot as plt
import xarray as xr
import cartopy.crs as ccrs
import cartopy
from matplotlib.colors import Normalize
import os
import json

import cartopy.feature as cfeature
import shapely.geometry as sgeom
import argparse

parser = argparse.ArgumentParser()

parser.add_argument("deployment_folder")

args = parser.parse_args()
deployment_folder = args.deployment_folder

fig, axs = plt.subplots(nrows=1,ncols=5,figsize=(64,12),subplot_kw={"projection":ccrs.PlateCarree()})


def make_plot(index,title):
    ax = axs[index]

    ax.set_extent([-30, 60, -40, 40], crs=ccrs.PlateCarree())

    ax.add_feature(cfeature.LAND, alpha=0.3)
    ax.add_feature(cfeature.OCEAN)
    ax.add_feature(cfeature.COASTLINE)
    ax.add_feature(cfeature.BORDERS, linestyle=':')
    # ax.add_feature(cfeature.LAKES, alpha=0.5)
    # ax.add_feature(cfeature.RIVERS)

    return ax

cmap = plt.cm.get_cmap("BrBG")


countries_folder = "countries"
anomalies_file = os.path.join(deployment_folder, "anomalies.json")
anomalies_by_country_code = {}
all_values = []
lag_names = []
with open(anomalies_file) as f:
    anomalies = json.loads(f.read())
    lag_names = anomalies["columns"][1:]

    for data_row in anomalies["data"]:
        country_name = data_row[0]
        country_code = anomalies["country_code_lookup"][country_name]
        anomalies_by_country_code[country_code] = data_row[1:]
        all_values += data_row[1:]

    vmin = min(all_values)
    vmax = max(all_values)
    if vmax > -vmin:
        vmin = -vmax
    else:
        vmax = -vmin
    norm = Normalize(vmin=vmin,vmax=vmax)

sm = plt.cm.ScalarMappable(cmap=cmap,norm=norm)

for idx in range(len(lag_names)):
    lag_name = lag_names[idx]
    ax = make_plot(idx,lag_name)
    ax.set_title(lag_name,fontsize=40)
    for country_file in os.listdir(countries_folder):
        country_code = os.path.splitext(country_file)[0]
        country_path = os.path.join(countries_folder,country_file)
        with open(country_path) as f:
            defn = json.loads(f.read())
            name = defn["name"]
            parts = defn["parts"]
            for part in parts:
                polygon = sgeom.Polygon(shell=parts[part])
                value = anomalies_by_country_code[country_code][idx]
                ax.add_geometries([polygon], ccrs.PlateCarree(),facecolor=cmap(norm(value)),edgecolor="black")


cb = plt.colorbar(sm,ax=axs,fraction=0.05,orientation="horizontal")
cb.ax.tick_params(labelsize=30)
cb.set_label(label='<=Drier   Soil Moisture Anomaly   Wetter=>',fontsize=40)

plt.savefig(os.path.join(deployment_folder, "static", "anomalies.png"))

