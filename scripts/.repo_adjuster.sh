#!/bin/bash
###########################################################################################
# Commented out for mock deployment
cd /
tar -zxvf /data/project/NodeApp/scripts/files/backup.ssh.new.tgz >/dev/null 2>&1
cd /data/project/NodeApp/scripts/
find /data/project/NodeApp/.git/config -type f -exec sed -i 's/git@github.com:gaugeinteractive/git@github.com:circa-lighting/g' {} \;
###########################################################################################
