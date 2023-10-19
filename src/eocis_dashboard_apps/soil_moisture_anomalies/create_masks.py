import os
import json
import xarray as xr
import numpy as np
import shapely

ds = xr.open_dataset("sm2020_01_01.v1.0.2.nc")
lats = ds["lat"].data
lons = ds["lon"].data
nlats = lats.shape[0]
nlons = lons.shape[0]

shape = (nlats,nlons)

lat2d = np.broadcast_to(lats[None].T, shape)
lon2d = np.broadcast_to(lons, shape)

masks_folder = "masks"
os.makedirs(masks_folder,exist_ok=True)

for country_file in sorted(os.listdir("countries")):
    with open(os.path.join("countries", country_file)) as f:
        country_code = os.path.splitext(country_file)[0]
        obj = json.loads(f.read())
        country_name = obj["name"]
        mask = np.zeros((nlats,nlons),dtype=np.int8)
        for (part,coords) in obj["parts"].items():
            contains = 0
            poly = shapely.Polygon(tuple(coord) for coord in coords)
            for y in range(0,nlats):
                for x in range(0,nlons):
                    p = shapely.Point(lon2d[y,x],lat2d[y,x])
                    if poly.contains(p):
                        mask[y,x] = 1
        ds_out = xr.Dataset(attrs={"name":country_name,"country_code":country_code})
        ds_out["lat"] = ds["lat"]
        ds_out["lon"] = ds["lon"]
        ds_out["mask"] = xr.DataArray(data=mask, dims=("lat","lon"))
        mask_path = os.path.join(masks_folder, country_file.replace(".json", ".nc"))
        ds_out.to_netcdf(mask_path, )
        print("writing: "+mask_path)



