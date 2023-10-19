import datetime
import os.path
import argparse
import csv
from collections import defaultdict
import logging

logging.basicConfig(level=logging.INFO)

from update import DATE_FORMAT

parser = argparse.ArgumentParser()
parser.add_argument("deployment_folder")
parser.add_argument("--start-year",type=int,default=1983)
parser.add_argument("--end-year",type=int,default=2013)

args = parser.parse_args()
csv_folder = os.path.join(args.deployment_folder, "csv")
climatology_csv_folder = os.path.join(args.deployment_folder, "climatology")

os.makedirs(climatology_csv_folder, exist_ok=True)

for csv_file in os.listdir(csv_folder):
    csv_path = os.path.join(csv_folder,csv_file)
    values_by_doy = defaultdict(list)
    logging.info(f"Reading {csv_path}")
    with open(csv_path) as f:
        rdr = csv.reader(f)
        for row in rdr:
            dt = datetime.datetime.strptime(row[0],DATE_FORMAT)
            doy = dt.timetuple().tm_yday
            v = float(row[1])
            values_by_doy[doy].append(v)
    climatology_path = os.path.join(climatology_csv_folder,csv_file)
    logging.info(f"Writing {climatology_path}")
    with open(climatology_path,"w") as f:
        wtr = csv.writer(f)
        for (doy,values) in values_by_doy.items():
            wtr.writerow([doy,sum(values)/len(values)])

