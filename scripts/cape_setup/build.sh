# write data to eeprom

sudo cat data.eeprom > /sys/bus/i2c/devices/2-0054/eeprom
# recompile dts to new dtbo and copy to firmware and to initramfs
dtc -O dtb -o BB-SerialCape-00A0.dtbo -b 0 -@ BB-SerialCape-00A0.dts
sudo cp BB-SerialCape-00A0.dtbo /lib/firmware
sudo update-initramfs -uk `uname -r`


