#!/bin/bash
# copy files as necessary for npm package
CSS_DIR=./lib/doremi-script/css
SRC_WEBAPP_DIR=./src/web_app/

rm -rf $CSS_DIR
echo "move css  to $CSS_DIR"
mkdir -p $CSS_DIR
mkdir -p ./lib/doremi-script/third_party
cp src/*.mustache lib/doremi-script/
cp -r $SRC_WEBAPP_DIR/css/* $CSS_DIR
cp ./vendor/third_party/zepto.unminified.js lib/doremi-script/third_party/
cp ./vendor/third_party/fraction.js lib/doremi-script/third_party/

