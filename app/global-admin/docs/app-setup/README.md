# App Setup

Below is step by step instructions to setup project on any windows computer. This guide will help you in setting up and running the Circa Screens Node App as well as the Couchbase database. Make sure you are signed into windows as **Admin User**. Both when setting up and running app.

## Install Docker Tool Box


### 1. Download docker toolbox for windows.

Follow instructions at `https://docs.docker.com/toolbox/toolbox_install_windows/`

**Notes:** 
* Please install newest driver and not the older one.
* Uncheck send data to docker on the “Setup - Docker Toolbox” dialog.
* Reboot after install.

### 2. Setup Docker Machine
Once you are logged back into windows on admin account. Open up Docker Quick Start Terminal. **Some prompts will require some interaction to run properly.**

The terminal does several things to set up Docker Toolbox for you. When it is done, and the terminal is displaying the $ prompt, run the following:
```
docker-machine stop default
docker-machine rm default
docker-machine create -d virtualbox --virtualbox-disk-size "60000" default
docker-machine stop default
```

This deletes the current virtural box and re-creates it with 60bg disk image

### 3. Setup Virtual Machine

Start by open VirtualBox, and click settings for the default virtual machine. Change the following settings:

* **System > Motherboard:** Change base memory from 1024 ram to 4096 ram.
* **System > Processor:** Change number of processors from 1 cpu to 4 cpu's.


Press ok and restart Virtual Machine:

```
docker-machine stop
docker-machine start
```

### 4. Setup Docker Images
Open up Docker Quick Start Terminal and run the following:

```
docker login
```

This will let you login into your docker hub account from the machine. Next pull the required docker containers:

```
docker pull couchbase
docker pull {your_docker_username}/circa
```

After the images are finished run the following: 

```
docker run --restart always -p 80:80 -p 443:443 -h nodeapp.localdomain --name nodeapp -dit {your_docker_username}/circa
docker run -d --restart always --name db -p 8091-8094:8091-8094 -p 11210:11210 couchbase
```

**Note:** *Please wait 5-10 mins for the docker containers to sync information up from github and b2.*

### 5. Setup Circa Screens Node App

Go to http://192.168.99.100:8091 in the browser to make sure you see a setup screen. This step is just to verify that couchbase is up and running, please do not press anything. After verifying, go to the Docker Quick Start Terminal and run the following:

```
docker exec -it nodeapp node /data/project/NodeApp/node/api/setup.js
```

**Note:** *Wait till the setup is finished before going to next step. You know its finished when the terminal echo's out the category images locations.*

Visit the following url to sync up all admin, slideshows and products from the master server.

http://192.168.99.100/api/sync/all


**Note:** *Please wait 45-75 min for products, images and admin to finish syncing.*

Once done visit http://192.168.99.100/collections to view the app.


## Notes

The docker machine & images must be running for local urls to run properly. 

To restart Docker machine & images run following commands from Docker Quick Start Terminal:

**Via Docker Quick Start Terminal**:
```
docker-machine stop
docker-machine start
```

### Dimension Settings

To scale product images properly visit the corresponding url. This will tell the app what screen size you are in **(55 Inch or 98 Inch)**, and save it for future use.

**Note:** *If product scale seems off, the browser might have forgotten the stored screen size setting. Visit the corresponding url to reset the screen size setting.*

`55 Inch Screen` - http://192.168.99.100/collections?screen=55

`98 Inch Screen` -  http://192.168.99.100/collections?screen=98


