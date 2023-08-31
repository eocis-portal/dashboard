#!/bin/bash

deployment_folder=$1

thisdir=`dirname $0`
# cp -r $thisdir/static $deployment_folder
cp -r $thisdir/countries $deployment_folder/static