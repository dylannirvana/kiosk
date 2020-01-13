###########################################################################################
# Pull git repo and rclone from b2
###########################################################################################
date_output=`date`
PROCESS_1_STATUS=`ps aux | grep .git_uptodate.sh | grep -v grep | wc -l`
if [ $PROCESS_1_STATUS = "0" ]; then
	echo "[ $date_output ] Grabbing latest repo info"
	sh /root/scripts/.repo_adjuster.sh >/dev/null 2>&1
	sh /root/scripts/.git_uptodate.sh >/dev/null 2>&1 &
fi

PROCESS_1_STATUS=`ps aux | grep rclone | grep -v grep | wc -l`
if [ $PROCESS_1_STATUS = "0" ]; then
    echo "[ $date_output ] Starting rclone process"
    sh /root/scripts/.sync_from_b2.sh >/dev/null 2>&1 &
fi
###########################################################################################
chmod 600 /data/project/NodeApp/crontabs/root
chown root:crontab /data/project/NodeApp/crontabs/root
cd /data/project/NodeApp/crontabs/
git update-index --assume-unchanged root
sh /root/scripts/.starter.sh &
###########################################################################################
while true; do
	PROCESS_1_STATUS=`ps aux | grep .starter.sh | grep -v grep | wc -l`
	if [ $PROCESS_1_STATUS = "0" ]; then
		date_output=`date`
		echo "[ $date_output ] Primary process ended"
		exit 1
	fi
	sleep 60
done
###########################################################################################
