
import os
import csv

timeseries = {}

root = os.path.split(__file__)[0]

for year in sorted(os.listdir(os.path.join(root,"data"))):
    year_folder = os.path.join(root,"data",year)
    for month in sorted(os.listdir(year_folder)):
        month_folder = os.path.join(year_folder,month)
        for filename in sorted(os.listdir(month_folder)):
            path = os.path.join(month_folder,filename)
            # stressYYYYMMDD.csv
            day = filename[12:14]
            with open(path) as f:
                rdr = csv.reader(f)
                cols = {}
                for line in rdr:
                    if len(cols) == 0:
                        for idx in range(0,len(line)):
                            cols[line[idx]] = idx
                    else:
                        country = line[cols["country"]]
                        stress = line[cols["stress"]]
                        if country not in timeseries:
                            timeseries[country] = []
                        timeseries[country].append([f"{year}-{month}-{day}",stress])

output_folder = os.path.join(root,"timeseries")
os.makedirs(output_folder,exist_ok=True)
for country in timeseries:
    path = os.path.join(output_folder,f"{country}.csv")
    with open(path,"w") as f:
        writer = csv.writer(f)
        writer.writerow(["date","stress"])
        for item in timeseries[country]:
            writer.writerow(item)

