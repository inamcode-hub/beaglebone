# Reboot System Logic

## Overview

This document explains how to implement and execute a reboot system script on a BeagleBone device, how to make the script executable, and how to integrate it into Docker commands for execution within a container.

## Step-by-Step Guide

### 1. Create the `scripts` Directory

On your BeagleBone device, create a `scripts` directory on your desktop and navigate into it:

```sh
mkdir ~/Desktop/scripts
cd ~/Desktop/scripts
```

### 2. Create the Reboot Script `reboot-system.sh`

```sh
#!/bin/bash
/bin/echo 1 > /proc/sys/kernel/sysrq
/bin/echo b > /proc/sysrq-trigger
```

### 3.Make the Script Executable

```sh
chmod +x reboot-system.sh
```

### 4. Docker Integration

```sh
// Docker commands
const commands = {
  buildDev: `docker build --load -t ${dockerDevImage} -f Dockerfile.dev .`,
  runDev: `docker run --network host --privileged --restart always --name beaglebone-app-dev --device=/dev/ttyS2 --env-file ${dockerDevEnvFile} -v ${dockerDevVolume} -v /:/host-root:ro -v ~/Desktop/scripts:/usr/local/bin/scripts -e HOST_IP=${hostIP} -e PUBLIC_IP=${publicIP} -e BEAGLEBONE_SERIAL_NUMBER=${uniqueIdentifier} ${dockerDevImage}`,
  buildProd: `docker build --load -t ${dockerProdImage} -f Dockerfile .`,
  runProd: `docker run --network host --privileged --restart always -d --name beaglebone-app --device=/dev/ttyS2 --env-file ${dockerProdEnvFile} -v /:/host-root:ro -v ~/Desktop/scripts:/usr/local/bin/scripts -e HOST_IP=${hostIP} -e PUBLIC_IP=${publicIP} -e BEAGLEBONE_SERIAL_NUMBER=${uniqueIdentifier} ${dockerProdImage}`,
};
```

We run container in a --privileged mode --restart always and copy script from folder and paste in container ~/Desktop/scripts:/usr/local/bin/scripts

### 5. Now execute this script from the Container

```sh
docker exec -it beaglebone-app-dev /bin/bash -c "/usr/local/bin/scripts/reboot-system.sh"
```
