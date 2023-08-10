# dashboard

repository for dashboard software and prototype apps

## dashboard apps introduction

a dashboard app is defined as one or more web pages, which may load data from statically served data files (for example, csv, json)

## app source code

an app is composed of the following source code:

* static HTML/CSS/javascript files (including the root page, `index.html`, and a thumbnail image, `thumbnail.png`)
* a metadata file `metadata.json` describing the name, authors, summary and other relevant info
  * the app can be accessed via the permanent link http://eocis.org/dashboard/apps/<name> using name defined in metadata.json
* an `update.sh` script which runs periodically (for example nightly) on the EOCIS server
* other scripts and programs which are invoked by the update script

the source code for the app would usually be stored in a github repo.

The app is served from a deployment folder, this will be passed as an argument to the update script
The update script will populate or refresh the deployment folder

## The update process:

* the latest version of the app's source code is pulled before each update runs
* the update script is only allowed to write or update files under the deployment folder
* the amount of data stored under the deployment folder will be restricted
* the update script is allowed to read any data files from the EOCIS datasets
* the update process should be efficient, incrementally updating any deployed data files
* one or more conda environments may be defined using `environment.yml` files and used in the update process
* however, the update process does not need to use 

