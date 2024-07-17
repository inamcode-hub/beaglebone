# System Configuration Documentation

This document tracks the system configurations and scripts used for setting up the BeagleBone.

## Internet Configuration

### Setting up DHCP Client for `eth0`

To ensure that the DHCP client runs for `eth0` at boot, we created a systemd service.

#### Steps

1. **Create the systemd service file**:

   - Path: `/etc/systemd/system/dhclient-eth0.service`
   - Content:

     ```ini
     [Unit]
     Description=Run dhclient on eth0 at boot
     After=network.target

     [Service]
     Type=oneshot
     ExecStart=/sbin/dhclient eth0
     RemainAfterExit=yes

     [Install]
     WantedBy=multi-user.target
     ```

2. **Reload systemd to recognize the new service**:
   ```bash
   sudo systemctl daemon-reload
   ```
