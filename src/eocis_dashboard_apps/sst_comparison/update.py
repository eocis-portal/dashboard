import datetime
import os.path
import csv
import xarray as xr
import json
import shutil
import logging

from plot import plot

config = {
    "analysed_sst60n60s.csv": {
        "min_lat": -60,
        "min_lon": -180,
        "max_lat": 60,
        "max_lon": 180,
        "variable": "analysed_sst",
        "plot_path": "plot.png"
    }
}

DATE_FORMAT = "%Y-%m-%d"

status_filename = "status.json"

def update(deployment_folder, data_start_date, data_load_fn, limit=0, rescan=True):
    if rescan:
        last_processed = data_start_date - datetime.timedelta(days=1)
        status_path = os.path.join(deployment_folder, status_filename)

        status = { "last_processed": last_processed.strftime(DATE_FORMAT) }
        if os.path.exists(status_path):
            with open(status_path) as f:
                status = json.loads(f.read())
                last_processed = datetime.datetime.strptime(status["last_processed"],"%Y-%m-%d")

        traversal_date = last_processed
        data = {}

        for csv_name in config:
            data[csv_name] = []
            csv_path = os.path.join(deployment_folder, csv_name)
            if os.path.exists(csv_path):
                with open(csv_path) as f:
                    rdr = csv.reader(f)
                    for line in rdr:
                        dt = datetime.datetime.strptime(line[0], "%Y-%m-%d")
                        v = float(line[1])
                        data[csv_name].append((dt, v))

        updated = set()
        loaded = 0
        while True:
            traversal_date += datetime.timedelta(days=1)
            ds = data_load_fn(traversal_date)
            if ds is None:
                break
            logging.info("Processing: "+traversal_date.strftime(DATE_FORMAT))
            loaded += 1
            if limit and loaded > limit:
                break

            for csv_name in config:
                min_lat = config[csv_name]["min_lat"]
                max_lat = config[csv_name]["max_lat"]
                min_lon = config[csv_name]["min_lon"]
                max_lon = config[csv_name]["max_lon"]
                variable = config[csv_name]["variable"]
                if len(data[csv_name]):
                    (last_dt,_) = data[csv_name][-1]
                else:
                    last_dt = None
                if last_dt is None or traversal_date > last_dt:
                    da = ds[variable].sel(lat=slice(min_lat,max_lat),lon=slice(min_lon,max_lon))
                    v = da.mean().data
                    data[csv_name].append((traversal_date,v))
                    updated.add(csv_name)

            status["last_processed"] = traversal_date.strftime(DATE_FORMAT)


        for csv_name in config:
            if csv_name in updated:
                csv_path = os.path.join(deployment_folder,csv_name)
                with open(csv_path,"w") as f:
                    wtr = csv.writer(f)
                    for (dt,v) in data[csv_name]:
                        dt_s = dt.strftime(DATE_FORMAT)
                        v_s = str(v)
                        wtr.writerow([dt_s,v_s])



        with open(status_path,"w") as f:
            f.write(json.dumps(status))

    for csv_name in config:
        csv_path = os.path.join(deployment_folder, csv_name)
        plot_path = os.path.join(deployment_folder,config[csv_name]["plot_path"])
        variable = config[csv_name]["variable"]
        plot(csv_path, plot_path, variable)

    thisdir = os.path.split(__file__)[0]
    static_folder = os.path.join(thisdir,"static")
    for static_file in os.listdir("static"):
        shutil.copy(os.path.join(static_folder,static_file),os.path.join(deployment_folder,static_file))

import argparse

parser = argparse.ArgumentParser()
parser.add_argument("deployment_folder")
parser.add_argument("--limit",type=int,default=0)

args = parser.parse_args()

def data_loader(dt):
    # data_path = f"/home/dev/data/regrid/sst/{dt.year}/{dt.month:02d}/{dt.day:02d}"
    data_path = f"/data/esacci_sst/public/CDR3.0_release/Analysis/L4/v3.0.1/{dt.year}/{dt.month:02d}/{dt.day:02d}"

    if os.path.exists(data_path):
        files = os.listdir(data_path)
        if len(files) == 1:
            data_file_path = os.path.join(data_path, files[0])
            print("Opening "+data_file_path)
            return xr.open_dataset(data_file_path)
    return None

data_start_date = datetime.date(1982,1,1)

logging.basicConfig(level=logging.INFO)

update(args.deployment_folder, data_start_date, data_loader, args.limit, rescan=False)


