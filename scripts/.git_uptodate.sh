#!/bin/bash
###########################################################################################
cd /data/project/NodeApp
 GITINFO=`[ $(git rev-parse HEAD) = $(git ls-remote $(git rev-parse --abbrev-ref @{u} | sed 's/\// /g') | cut -f1) ] && echo uptodate || echo outofdate`
###########################################################################################
if [ $GITINFO = "outofdate" ]
then

    apt update -y >/dev/null 2>&1 ; apt install imagemagick -y >/dev/null 2>&1 ;

    unlink /data/project/NodeApp/app/frontend/dist/static/media
    unlink /data/project/NodeApp/app/global-admin/dist/static/media
    unlink /data/project/NodeApp/node/api/media

    cd /data/project/NodeApp/
    git checkout crontabs/root
    git pull origin master >/dev/null 2>&1
    ln -s /data/media/ /data/project/NodeApp/app/frontend/dist/static/media
    ln -s /data/media/ /data/project/NodeApp/app/global-admin/dist/static/media
    ln -s /data/media/ /data/project/NodeApp/node/api/media

    cd /data/project/NodeApp/app/frontend
    rm -rf package-lock.json
    npm install >/dev/null 2>&1
    
    cd /data/project/NodeApp/app/global-admin
    rm -rf package-lock.json
    npm install >/dev/null 2>&1

    cd /data/project/NodeApp/node/api
    rm -rf package-lock.json
    npm install >/dev/null 2>&1

    ####################################################################
    # This is needed to fix categories if changes are necessary.
    ####################################################################
    # node fix/categories.js >/dev/null 2>&1

    rm -rf var/tmp/categories.json

    chmod 600 /data/project/NodeApp/crontabs/root
    chown root:crontab /data/project/NodeApp/crontabs/root
    cd /data/project/NodeApp/crontabs/
    git update-index --assume-unchanged root

    /etc/init.d/cron reload >/dev/null 2>&1
    /etc/init.d/cron stop >/dev/null 2>&1

    echo "invaild" > /data/project/NodeApp/scripts/.starter_checksum
    

fi

date > /root/.gitlastupdated
###########################################################################################
