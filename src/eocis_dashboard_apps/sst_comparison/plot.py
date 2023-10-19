
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import tempfile
import csv
import datetime

sns.set(rc={'figure.figsize': (20, 10)})

def split_date(input_csv,output_csv,variable_name):
    series = []
    with open(output_csv,"w") as of:
        wtr = csv.writer(of)
        wtr.writerow(["year","doy",variable_name])
        with open(input_csv) as f:
            reader = csv.reader(f)
            for line in reader:
                dt = datetime.datetime.strptime(line[0],"%Y-%m-%d")
                v = float(line[1])
                doy = dt.timetuple().tm_yday
                wtr.writerow([dt.year,doy,v])


def plot(input_csv,output_png,variable_name):
    with tempfile.NamedTemporaryFile(suffix=".csv") as temp_csv:
        split_date(input_csv,temp_csv.name,variable_name)
        df = pd.read_csv(temp_csv.name)
        sns.lineplot(data=df, x="doy", y=variable_name, hue="year")
        plt.savefig(output_png)




