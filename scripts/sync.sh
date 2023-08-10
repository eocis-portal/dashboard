#!/bin/bash

rootfolder=/home/dev/github/dashboard

rsync -avr $rootfolder/apps dev@192.171.169.123:/home/dev/github/dashboard

