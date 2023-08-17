import datetime
import os
import csv
import xarray as xr
import json
import logging

DATE_FORMAT = "%Y-%m-%d"


def update(deployment_folder, data_start_date, data_load_fn, limit=0, rescan=True):

    if rescan:
        csv_folder = os.path.join(deployment_folder,"csv")
        masks_folder = "masks"
        masks = {}
        timeseries = {}

        status_filename = "status.json"

        last_processed = data_start_date - datetime.timedelta(days=1)
        status_path = os.path.join(deployment_folder, status_filename)

        status = {"last_processed": last_processed.strftime(DATE_FORMAT)}
        if os.path.exists(status_path):
            with open(status_path) as f:
                status = json.loads(f.read())
                last_processed = datetime.datetime.strptime(status["last_processed"], "%Y-%m-%d")

        for mask_file in os.listdir(masks_folder):
            country_code = os.path.splitext(mask_file)[0]
            ds = xr.open_dataset(os.path.join(masks_folder,mask_file))
            masks[country_code] = ds["mask"].data

        os.makedirs(csv_folder, exist_ok=True)
        for csv_file in os.listdir(csv_folder):
            country_code = os.path.splitext(csv_file)[0]
            ts = []
            with open(os.path.join(csv_folder,csv_file)) as f:
                rdr = csv.reader(f)
                for row in rdr:
                    dt = datetime.datetime.strptime(row[0],DATE_FORMAT)
                    v = float(row[1])
                    ts.append((dt,v))
            timeseries[country_code] = ts

        for country_code in masks:
            if country_code not in timeseries:
                timeseries[country_code] = []

        dt = last_processed + datetime.timedelta(days=1)

        loaded = 0
        while True:

            ds = data_load_fn(dt)
            if ds is not None:
                logging.info("Processing: " + dt.strftime(DATE_FORMAT))
                da = ds["beta_c4grass"].isel(time=0)
                for (country_code, mask) in masks.items():
                    ts = timeseries[country_code]

                    mean = da.where(mask).mean(skipna=True).data

                    if len(ts):
                        latest_dt = ts[-1][0]
                        if dt <= latest_dt:
                            continue
                    ts.append((dt,mean))
                status["last_processed"] = dt.strftime(DATE_FORMAT)
            else:
                break
            dt += datetime.timedelta(days=1)
            loaded += 1
            if limit > 0 and loaded >= limit:
                break

        with open(status_path,"w") as f:
            f.write(json.dumps(status))

        for country_code in timeseries:
            with open(os.path.join(csv_folder,country_code+".csv"),"w") as f:
                wtr = csv.writer(f)
                ts = timeseries[country_code]
                for (dt,v) in ts:
                    wtr.writerow([dt.strftime("%Y-%m-%d"),str(v)])


import argparse

parser = argparse.ArgumentParser()
parser.add_argument("deployment_folder")
parser.add_argument("--limit",type=int,default=0)

args = parser.parse_args()

data_start_date = datetime.date(1983,1,1)

def data_loader(dt):
    year = dt.year
    month = dt.month
    day = dt.day
    file_path = f"/home/dev/data/soil_moisture/daily/{year}/{month:02d}/sm{year}_{month:02d}_{day:02d}.v1.0.2.nc"

    if os.path.exists(file_path):
        return xr.open_dataset(file_path)
    return None

logging.basicConfig(level=logging.INFO)

update(args.deployment_folder, data_start_date, data_loader, args.limit, rescan=True)
