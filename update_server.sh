#!/usr/bin/env bash
sudo chmod 777 ./logs/*
git pull
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
bash restart_services.sh 

