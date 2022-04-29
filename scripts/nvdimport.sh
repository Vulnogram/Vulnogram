#!/bin/bash
# Copyright (c) 2018 Chandan B N. All rights reserved.


# NVD JSON feed is a single JSON object containing CVE_Items array.
# Mongoimport wants a JSON array.
# strip the wrapper around the CVE_Items array using egrep

#for i in {2002..2020}; do curl --silent --show-error https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-$i.json.gz | gunzip -c > var/$i.json; done

# curl --silent --show-error https://nvd.nist.gov/feeds/json/cve/1.0/nvdcve-1.0-modified.json.gz | gunzip -c | nvdimport.sh -
for f in "$@"
do
    { echo '[{'; egrep -v '(^\s\s"CVE)|^[{}]' "$f";} | mongoimport --quiet -d vulnogram --jsonArray -c nvds --upsert --upsertFields 'cve.CVE_data_meta.ID'
done
