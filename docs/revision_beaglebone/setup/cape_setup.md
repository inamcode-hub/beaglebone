# Cape Setup for BeagleBone

## Objective

This guide provides step-by-step instructions to set up the cape on your BeagleBone. It includes compiling the device tree source, updating the EEPROM, and configuring the system to automatically load the cape on boot.

## Files Required

- `BB-SerialCape-00A0.dtbo`: Compiled device tree overlay.
- `BB-SerialCape-00A0.dts`: Device tree source file used to generate the `.dtbo`.
- `data.eeprom`: EEPROM data file for cape configuration.
- `build.sh`: Script to automate the setup process.

## Setup Steps

### Step 1: Prepare the Cape Setup Directory

1. **Create a directory to store cape setup files:**

   ```bash
   mkdir cape_setup
   ```

2. **Copy all the necessary files into the `cape_setup` directory:**

   Place `BB-SerialCape-00A0.dtbo`, `BB-SerialCape-00A0.dts`, `data.eeprom`, and `build.sh` inside the `cape_setup` directory.

### Step 2: Write EEPROM Data

1. **Write the EEPROM data to configure the cape:**

   ```bash
   sudo cat data.eeprom > /sys/bus/i2c/devices/2-0054/eeprom
   ```

### Step 3: Compile the Device Tree Source

1. **Compile the `.dts` file into a `.dtbo` file:**

   ```bash
   dtc -O dtb -o BB-SerialCape-00A0.dtbo -b 0 -@ BB-SerialCape-00A0.dts
   ```

2. **Copy the compiled overlay to the firmware directory:**

   ```bash
   sudo cp BB-SerialCape-00A0.dtbo /lib/firmware
   ```

### Step 4: Configure U-Boot to Load the Cape on Boot

1. **Edit the `/boot/uEnv.txt` file:**

   ```bash
   sudo nano /boot/uEnv.txt
   ```

2. **Add your cape overlay file:**

   Uncomment and modify the line under `### Custom Cape` to:

   ```plaintext
   dtb_overlay=/lib/firmware/BB-SerialCape-00A0.dtbo
   ```

3. **Save and exit** the editor.

### Step 5: Update Initramfs

1. **Update initramfs to ensure the cape overlay loads on boot:**

   ```bash
   sudo update-initramfs -uk $(uname -r)
   ```

### Step 6: Reboot the BeagleBone

1. **Reboot the system to apply changes:**

   ```bash
   sudo reboot
   ```

### Step 7: Verify Cape is Loaded

1. **Check if the cape is loaded using `dmesg`:**

   ```bash
   dmesg | grep cape
   ```

2. **Verify the active overlays:**

   ```bash
   cat /sys/devices/platform/bone_capemgr/slots
   ```

## Troubleshooting

- **Error Messages**: If you see errors in `dmesg`, ensure that the `.dtbo` file is correctly compiled and placed in `/lib/firmware`.
- **Permissions**: Ensure all commands are run with appropriate permissions (`sudo`).
- **Logs**: Monitor system logs to catch any configuration issues that may arise.

## Notes

- Ensure the `.dtbo` file and EEPROM configurations are tested in a safe environment to avoid conflicts with other capes or hardware.
- Regularly update the cape files and configurations if modifications are made to the hardware setup.
