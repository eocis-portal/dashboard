import json
import calendar
import os.path
import csv
import random

with open("/home/dev/github/dashboard/static/apps/africa_plant_water_stress/africa-outline-with-countries_6.geojson") as f:
    o = json.loads(f.read())

f = o["features"]

countries = []
for idx in range(0,len(f)):
    properties = o["features"][idx]["properties"]
    countries.append(properties["adm0_a3"])

for year in range(2010,2020):
    for month in range(1,13):
        folder = os.path.join(os.path.split(__file__)[0],"data",f"{year:04d}",f"{month:02d}")
        os.makedirs(folder,exist_ok=True)
        days_in_month = calendar.monthrange(year, month)[1]
        for day in range(1,days_in_month):
            filename=f"stress{year:04d}{month:02d}{day:02d}.csv"
            with open(os.path.join(folder,filename),"w") as f:
                writer = csv.writer(f)
                writer.writerow(["country","stress"])
                for country in countries:
                    stress = random.random()
                    writer.writerow([country,stress])
