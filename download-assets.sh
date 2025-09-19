#!/bin/bash

# Create directories
mkdir -p squarespace-site/css
mkdir -p squarespace-site/js

# Download CSS files
echo "Downloading CSS files..."

# Squarespace CSS files
curl -o "squarespace-site/css/squarespace-clarkson-v2.css" "https://assets.squarespace.com/universal/fonts/squarespace-clarkson-v2.css"
curl -o "squarespace-site/css/417923393ce481a1-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/417923393ce481a1-min.en-US.css"
curl -o "squarespace-site/css/8f0df834fd9e0f0a-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/8f0df834fd9e0f0a-min.en-US.css"
curl -o "squarespace-site/css/cde1a02072287e00-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/cde1a02072287e00-min.en-US.css"
curl -o "squarespace-site/css/99442e64b835c75a-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/99442e64b835c75a-min.en-US.css"
curl -o "squarespace-site/css/7cf25981cabb7ba2-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/7cf25981cabb7ba2-min.en-US.css"
curl -o "squarespace-site/css/2a23c0362959531e-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/2a23c0362959531e-min.en-US.css"
curl -o "squarespace-site/css/2b8cb18d1993dfe1-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/2b8cb18d1993dfe1-min.en-US.css"
curl -o "squarespace-site/css/ef5a02839ed413be-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/ef5a02839ed413be-min.en-US.css"
curl -o "squarespace-site/css/c248b84d50568f6a-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/c248b84d50568f6a-min.en-US.css"
curl -o "squarespace-site/css/50de2bc0b5890846-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/50de2bc0b5890846-min.en-US.css"
curl -o "squarespace-site/css/70599b093e15b35c-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/70599b093e15b35c-min.en-US.css"
curl -o "squarespace-site/css/94bfa9ac4360a9f5-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/94bfa9ac4360a9f5-min.en-US.css"
curl -o "squarespace-site/css/729556c2106e6155-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/729556c2106e6155-min.en-US.css"
curl -o "squarespace-site/css/5408d9ed2dca3c7a-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/5408d9ed2dca3c7a-min.en-US.css"
curl -o "squarespace-site/css/7fae10461562ac5e-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/7fae10461562ac5e-min.en-US.css"
curl -o "squarespace-site/css/b9b8f13996c52772-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/b9b8f13996c52772-min.en-US.css"
curl -o "squarespace-site/css/3b8d68585fe88b53-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/3b8d68585fe88b53-min.en-US.css"
curl -o "squarespace-site/css/7a037f50d3ee1c8f-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/7a037f50d3ee1c8f-min.en-US.css"
curl -o "squarespace-site/css/b6855f3bd6138216-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/b6855f3bd6138216-min.en-US.css"
curl -o "squarespace-site/css/management-37cd9a002eb40e6f-min.en-US.css" "https://assets.squarespace.com/universal/scripts-compressed/../styles-compressed/management-37cd9a002eb40e6f-min.en-US.css"

# Download JavaScript files
echo "Downloading JavaScript files..."

curl -o "squarespace-site/js/gtm.js" "https://www.googletagmanager.com/gtm.js?id=GTM-BCCP"
curl -o "squarespace-site/js/legacy.js" "https://assets.squarespace.com/@sqs/polyfiller/1.6/legacy.js"
curl -o "squarespace-site/js/modern.js" "https://assets.squarespace.com/@sqs/polyfiller/1.6/modern.js"
curl -o "squarespace-site/js/extract-css-runtime-48635bc2c2820844-min.en-US.js" "https://assets.squarespace.com/universal/scripts-compressed/extract-css-runtime-48635bc2c2820844-min.en-US.js"
curl -o "squarespace-site/js/error-reporter-148043c8cdafc18e-min.en-US.js" "https://assets.squarespace.com/universal/scripts-compressed/error-reporter-148043c8cdafc18e-min.en-US.js"
curl -o "squarespace-site/js/cldr-resource-pack-c5175d8ac6fd7505-min.en-US.js" "https://assets.squarespace.com/universal/scripts-compressed/cldr-resource-pack-c5175d8ac6fd7505-min.en-US.js"
curl -o "squarespace-site/js/config-appshell-ae867665a8b5efe7-min.en-US.js" "https://assets.squarespace.com/universal/scripts-compressed/config-appshell-ae867665a8b5efe7-min.en-US.js"
curl -o "squarespace-site/js/stripe.js" "https://js.stripe.com/basil/stripe.js"
curl -o "squarespace-site/js/connect.js" "https://connect-js.stripe.com/v1.0/connect.js"

echo "Asset download complete!"