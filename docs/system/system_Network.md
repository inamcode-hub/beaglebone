# System Configuration Documentation

This document tracks the system configurations and scripts used for setting up the BeagleBone.

## Internet Configuration

### Setting up NetworkManager for `eth0`

To ensure that the `eth0` interface is managed automatically, we replaced the manual `dhclient` configuration with NetworkManager.

#### Steps

1. **Install NetworkManager**:

   ```bash
   sudo apt-get update
   sudo apt-get install network-manager
   ```

2. **Enable and Start NetworkManager**:

   ```bash
   sudo systemctl enable NetworkManager
   sudo systemctl start NetworkManager
   ```

3. **Create the NetworkManager configuration file for `eth0`**:

   - Path: `/etc/NetworkManager/system-connections/eth0.nmconnection`
   - Content:

     ```ini
     [connection]
     id=eth0
     uuid=$(uuidgen)
     type=ethernet
     interface-name=eth0
     autoconnect=true

     [ipv4]
     method=auto

     [ipv6]
     method=ignore
     ```

4. **Reload NetworkManager to apply the new configuration**:

   ```bash
   sudo systemctl restart NetworkManager
   ```

5. **Verify the network status**:
   ```bash
   nmcli device status
   ```

By using NetworkManager, the BeagleBone device can automatically reconnect and re-establish the internet connection under various scenarios, ensuring robust network connectivity.
