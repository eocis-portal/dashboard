#!/bin/bash

deployment_folder=$1

conda activate xarray

python update.py $deployment_folder
