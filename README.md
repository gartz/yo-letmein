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


Starting the server
-------------------

After run `npm install` you can start the server using `npm start`

Options:
* listen - A port or socket
* http - A port or socket for HTTP
* https - A port or socket for HTTPS
* key - Key file required for HTTPS
* crt - Certificate file required for HTTPS
* insecure - Allows using http and https in the listen host, default is disabled and will redirect HTTP to HTTPS
* httpsOff - Disable the HTTPS and force insecure


TODO
----

* Remove the redirect soket, it not need to be exposed at all
* Add a help param
* Add URL whitelist
