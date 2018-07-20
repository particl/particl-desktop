#!/bin/sh
yarn install
ng serve --host 0.0.0.0 --port $PORT --env=$GUI_ENV
