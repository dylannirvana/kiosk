# Circa-Lighting-NodeApp

### API couchbase setup

1. Login as admin on the computer
2. Download docker toolbox for windows
3. Run setup for docker toolbox for windows
4. Uncheck send data to docker, then press next
5. continue with the setup. Note please install newest driver and not the older one.
6. reboot after install
7. log back into admin user
8. Open up docker quick start terminal. Some promts will require some interaction and allowed to run.
9. Once its finished run the following

'''
docker-machine stop default
docker-machine rm default
docker-machine create -d virtualbox --virtualbox-disk-size "60000" default
docker-machine stop default
'''

This deletes the current virtural box and re-creates it with 60bg disk image

10. open virtual box
11. click setting for the default virtual machine
12. click system
13. by default the motherboard will show 1024 ram. change it to 4096 ram.
14. by default the processor will show 1 cpu. change it to 4 cpu's
15. press ok.
16. close out virtual box
17. go back to docker quick start terminal screen
18. run the following

'''
docker login
'''

This will let you login into your docker account from the machine

19. pull docker containers

'''
docker pull couchbase
docker pull {docker username}/circa
'''

20. run the following after the images are finished

'''
docker run --restart always -p 80:80 -p 443:443 -h nodeapp.localdomain --name nodeapp -dit {docker username}/circa
docker run -d --restart always --name db -p 8091-8094:8091-8094 -p 11210:11210 couchbase
'''

Note: Please wait 5 mins for the docker containers to sync information up from github and b2

21. go to http//192.168.99.100:8091 in the browser to make sure you see a setup screen. Please dont press anything because this step is to verfiy that couchbase is up and running.

22. go to the docker quick start terminal and run the following

'''
docker exec -it nodeapp node /data/project/NodeApp/node/api/setup.js
'''

23. wait till the setup is finished before going to next step. You know its finsihed when it echo's out the category image locations.

24. goto the following url's to sync up admin, slideshows and products from the master server.

http://192.168.99.100/api/sync/admin
http://192.168.99.100/api/sync/slideshows
http://192.168.99.100/api/sync/products

25. Please wait an hour for the products to finsih.
26. Everything is all setup
