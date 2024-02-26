#!/usr/bin/env bash

set -e
cd "$(dirname "${BASH_SOURCE[0]}")"

echo Building docs...
mkdir -p ../docs
{
    awk '/just-hash\.css/ { exit(0) } { print }' ../dist/just-hash.html
    echo '<style type="text/css">'
    cat ../dist/just-hash.css
    echo '</style>'
    awk 'active { if (/just-hash.js/) { exit(0) } print } /just-hash\.css/ { active=1 } ' ../dist/just-hash.html
    echo '<script type="text/javascript">'
    cat ../dist/just-hash.js
    echo '</script>'
    awk 'active { print } /just-hash\.js/ { active=1 }' ../dist/just-hash.html

} >../docs/index.html.tmp

mv -f ../docs/index.html.tmp ../docs/index.html
