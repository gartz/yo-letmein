yo-letmein
==========

A home project to be used with Raspberry PI, that starts a server to allow YO trigger the GPIO to do stuffs like open doors

What you need
-------------

* nodejs
* gpio support for nodejs

Install the gpio lib support to run this software
```
git clone git://github.com/quick2wire/quick2wire-gpio-admin.git
cd quick2wire-gpio-admin
make
sudo make install
sudo adduser $USER gpio
```

The Relay Circuit
-----------------

http://projects.privateeyepi.com/home/on-off-project

