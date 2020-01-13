#!/bin/bash
###########################################################################################
keeper=`true`
###########################################################################################
# Close out all procesess running
###########################################################################################
finish() {
  date_output=`date`
  keeper=`false`
  echo "[ $date_output ] Exiting all processes"
  cd /data/project/NodeApp/node/api
  /usr/bin/pm2-runtime stop ecosystem.config.js >/dev/null 2>&1 &
  sleep 5
  /usr/sbin/nginx -s stop >/dev/null 2>&1 &
  /etc/init.d/cron stop >/dev/null 2>&1 &
}
trap finish EXIT
###########################################################################################
# Killing all processes just incase restart of docker happened
###########################################################################################
date_output=`date`
echo "[ $date_output ] Startup script starting"
echo "[ $date_output ] Killing all leftover processes"
/etc/init.d/cron stop >/dev/null 2>&1
/etc/init.d/nginx stop >/dev/null 2>&1
cd /data/project/NodeApp/node/api
/usr/bin/pm2-runtime stop ecosystem.config.js >/dev/null 2>&1
date_output=`date`
echo "[ $date_output ] Waiting 5 second before init of processes"
sleep 5

###########################################################################################
# Start the cron process
###########################################################################################
date_output=`date`
echo "[ $date_output ] Starting cron process"
/etc/init.d/cron stop >/dev/null 2>&1
sleep 5
/usr/sbin/cron -f &

###########################################################################################
# Start the nginx process
###########################################################################################
date_output=`date`
echo "[ $date_output ] Starting nginx process"
/etc/init.d/nginx stop >/dev/null 2>&1
sleep 5
/usr/sbin/nginx &

###########################################################################################
# Start the pm2/node process
###########################################################################################
date_output=`date`
echo "[ $date_output ] Starting pm2/node process"
cd /data/project/NodeApp/node/api
pm2-runtime ecosystem.config.js >/dev/null 2>&1 &

###########################################################################################
# Loop check and to restart processes if not present
###########################################################################################
while $keeper; do
  sleep 10
  date_output=`date`
  
  PROCESS_1_STATUS=`ps aux | grep nginx | grep -v grep | wc -l`
  PROCESS_2_STATUS=`ps aux | grep node | grep -v grep | wc -l`
  PROCESS_3_STATUS=`ps aux | grep cron | grep -v grep | wc -l`

  if [ $PROCESS_1_STATUS = "0" ]; then
      echo "[ $date_output ] Restarting nginx process"
      /etc/init.d/nginx stop >/dev/null 2>&1
      /usr/sbin/nginx -s stop  >/dev/null 2>&1
      sleep 10
      /usr/sbin/nginx &
  fi
  
  if [ $PROCESS_2_STATUS = "0" ]; then
      echo "[ $date_output ] Restarting pm2/node process"
      cd /data/project/NodeApp/node/api
      /usr/bin/pm2-runtime ecosystem.config.js >/dev/null 2>&1
  fi

  if [ $PROCESS_3_STATUS = "0" ]; then
      echo "[ $date_output ] Restarting cron process"
      /etc/init.d/cron stop >/dev/null 2>&1
      sleep 10
      /usr/sbin/cron -f &
  fi

  md5sum_current=`md5sum /data/project/NodeApp/scripts/.starter.sh`
  md5sum_last=`cat /data/project/NodeApp/scripts/.starter_checksum`

  if [ "$md5sum_current" != "$md5sum_last" ]; then
    echo "[ $date_output ] Startup Script has changed"
    echo "[ $date_output ] Starting Shutdown for docker reload"
    md5sum /data/project/NodeApp/scripts/.starter.sh > /data/project/NodeApp/scripts/.starter_checksum
    exit 1 
  fi

done

###########################################################################################
