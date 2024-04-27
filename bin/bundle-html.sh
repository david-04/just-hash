#!/usr/bin/env bash

set -e
cd "$(dirname "${BASH_SOURCE[0]}")"

echo Building docs...

mkdir -p ../docs

# shellcheck disable=SC2002
cat ../dist/just-hash.html |
    awk '{if (/just-hash.css/) { print "<style type=\\"text/css\\">"; system("cat ../dist/just-hash.css"); print "</style>"} else {print}}' |
    awk '{if (/just-hash.js/) { print "<script type=\\"text/javascript\\">"; system("cat ../dist/just-hash.js"); print "</script>"} else {print}}' |
    awk '{if (/favicon.svg/) { printf("%s","<link rel=\\"icon\\" href=\\"data:image/svg+xml;base64,"); system("base64 --wrap=0 ../dist/favicon.svg"); print "\\"/>"} else {print}}' \
        >../docs/index.html
