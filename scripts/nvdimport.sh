#!/bin/bash
# Copyright (c) 2018 Chandan B N. All rights reserved.


# NVD JSON feed is a single JSON object containing CVE_Items array.
# Mongoimport wants a JSON array.
# strip the wrapper around the CVE_Items array using egrep
for f in "$@"
do
    { echo '[{'; egrep -v '(^\s\s"CVE)|^[{}]' "$f";} | mongoimport -d vulnogram --jsonArray -c nvd --upsert --upsertFields 'cve.CVE_data_meta.ID'
done