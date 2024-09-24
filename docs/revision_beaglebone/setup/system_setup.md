# System Setup

## Objective

Set up the basic system configuration for the BeagleBone.

## Steps

1. **Configure DNS Settings**

   To ensure the system can resolve domain names correctly, configure DNS settings using `systemd-resolved`.

   - Edit the `/etc/systemd/resolved.conf` file:

     ```bash
     sudo nano /etc/systemd/resolved.conf
     ```

   - Add or update the DNS settings by uncommenting and setting the following lines:

     ```plaintext
     [Resolve]
     DNS=8.8.8.8 8.8.4.4
     FallbackDNS=1.1.1.1 1.0.0.1
     ```

   - Save and exit the file, then restart the DNS resolver service:

     ```bash
     sudo systemctl restart systemd-resolved
     ```

   - Verify DNS settings:
     ```bash
     systemd-resolve --status
     ```

2. **Update the `/etc/resolv.conf` Symlink (if needed)**

   To ensure DNS settings persist correctly, update the symlink for `/etc/resolv.conf`:

   ```bash
   sudo rm /etc/resolv.conf
   sudo ln -s /run/systemd/resolve/resolv.conf /etc/resolv.conf
   ```

3. **Test Internet Connectivity**

   Check that DNS and internet connectivity are working:

   ```bash
   ping google.com -c 4
   ```

4. **Install NetworkManager**

   Once DNS is correctly configured, install NetworkManager to manage network connections:

   ```bash
   sudo apt update
   sudo apt install network-manager -y
   ```

## Verification

- Confirm all packages are up to date using:

  ```bash
  sudo apt list --upgradable
  ```

- Verify NetworkManager is installed:
  ```bash
  nmcli --version
  ```

## Troubleshooting Tips

- If any step fails, ensure you have the correct permissions (use `sudo`).
- Reboot the device if any installation fails to ensure configurations are applied correctly.
- If DNS issues persist, ensure `/etc/systemd/resolved.conf` is properly configured, and that `/etc/resolv.conf` points to `/run/systemd/resolve/resolv.conf`.
- Check NetworkManager status if it's not working:
  ```bash
  sudo systemctl status NetworkManager
  ```

## Notes

- Complete each step before moving to the next to avoid setup issues.
- Update this document as needed when adding new dependencies or steps.
