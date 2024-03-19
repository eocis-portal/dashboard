# dashboard

repository for dashboard applications

A dashboard app is defined as one or more web pages, which may load data from statically served data files (for example, csv, json)

## app source code

Each app is composed of the following, stored under a sub-folder of [static/apps](static/apps):

* static HTML/CSS/javascript files (including the root page, `index.html`
* a thumbnail image, `thumbnail.png`) that should be 400x400 pixels
* data files stored in a `data` sub-directory. 

## main page

the [index.html](index.html) file is a bootstrap-based simple web app which display's each app#s thumbnail image in a tile and opens the app itself
in an iframe when the tile is clicked.  Each app needs to have a tile definition added to this file.  This should be self-explanatory.

The app can be accessed directly via the permanent link `https://eocis.org/portal/dashboard/?app=<name>` to allow bookmarking

## backends

apps may require data files to be generated or regularly updated in each app's `data` sub-directory, 
in these cases the code for the backends to do this is stored in the [dashboard-backend](https://github.com/eocis-portal/dashboard-backend) repo
