import datetime
import os
import csv
import json

def load_country_name_lookup(countries_folder):
    lookup = {}
    for country_file in os.listdir(countries_folder):
        country_code = os.path.splitext(country_file)[0]
        country_path = os.path.join(countries_folder,country_file)
        with open(country_path) as f:
            o = json.loads(f.read())
            country_name = o["name"]
            lookup[country_code] = country_name
    return lookup

def read_csv(path,is_climatology=False):
    values = []
    with open(path) as f:
        rdr = csv.reader(f)
        for line in rdr:
            v = float(line[1])
            if is_climatology:
                doy = int(line[0])
                values.append((doy,v))
            else:
                dt = datetime.datetime.strptime(line[0],"%Y-%m-%d")
                values.append((dt,v))
    return values

def get_anomalies(csv_folder,climatology_folder,lags):
    anomalies_by_country = {}
    for csv_filename in os.listdir(csv_folder):
        print(csv_filename)
        country_code = os.path.splitext(csv_filename)[0]
        csv_path = os.path.join(csv_folder,csv_filename)
        sm_values = read_csv(csv_path,False)
        climatology_path = os.path.join(climatology_folder,csv_filename)
        climatology_values = {}
        for (doy,value) in read_csv(climatology_path,True):
            climatology_values[doy] = value
        anomalies_by_lag = {}
        for lag in lags:
            latest_sm_values = sm_values[-lag:]
            anomalies = []
            for (dt,sm_value) in latest_sm_values:
                yday = dt.timetuple().tm_yday
                clim_value = climatology_values[yday]
                anomalies.append(sm_value-clim_value)
            mean_anomaly = sum(anomalies)/len(anomalies)
            anomalies_by_lag[lag] = mean_anomaly

        anomalies_by_country[country_code] = anomalies_by_lag
    return anomalies_by_country

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("deployment_folder")
    parser.add_argument("--output-csv-name",default="static/data/anomalies.csv")
    parser.add_argument("--output-json-name", default="anomalies.json")
    args = parser.parse_args()
    csv_folder = os.path.join(args.deployment_folder, "csv")
    countries_folder = os.path.join(args.deployment_folder, "countries")
    country_name_lookup = load_country_name_lookup(countries_folder)
    country_code_lookup = { country_name:country_code for (country_code,country_name) in country_name_lookup.items() }
    climatology_csv_folder = os.path.join(args.deployment_folder, "climatology")
    lags = [30,60,90,180,365]
    anomalies = get_anomalies(csv_folder,climatology_csv_folder,lags)
    output_csv_path = os.path.join(args.deployment_folder,args.output_csv_name)
    output_folder = os.path.split(output_csv_path)[0]
    os.makedirs(output_folder,exist_ok=True)
    with open(output_csv_path,"w") as f:
        wtr = csv.writer(f)
        wtr.writerow(["Country"]+["Anomaly (last %d days)"%lag for lag in lags])
        for (country_code,anomalies_by_lag) in anomalies.items():
            country_name = country_name_lookup[country_code]
            wtr.writerow([country_name] + [anomalies_by_lag[lag] for lag in lags])
    output_json_path = os.path.join(args.deployment_folder, args.output_json_name)
    output_folder = os.path.split(output_json_path)[0]
    os.makedirs(output_folder, exist_ok=True)

    with open(output_json_path, "w") as f:
       data = []
       columns = ["Country"] + ["Anomaly (last %d days)" % lag for lag in lags]
       for (country_code, anomalies_by_lag) in anomalies.items():
           country_name = country_name_lookup[country_code]
           data.append([country_name] + [anomalies_by_lag[lag] for lag in lags])
       obj = {
           "columns": columns,
           "data": data,
           "country_code_lookup": country_code_lookup
       }
       f.write(json.dumps(obj))
        # print(f"{country_code} => {anomalies_by_lag.items()}")
