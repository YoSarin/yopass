# Getting precious data out of the android app
Recently I've got a bit stucked with one application I wrote and i needed to retrieve content of its sqlite database.

1. ```adb backup -f ~/data.ab -noapk app.package.name``` didn't work
1. Phone was not rooted
1. Application is debuggable (basically means you manually deployed it via adb/VisualStudio/cordova/...)
1. I've lost the certificate used to deploy that app
1. It is password manager
1. I had all my passwords in it
1. It has no ```export``` feature

There exists [pretty neat article](https://blog.shvetsov.com/2013/02/access-android-app-data-without-root.html) on how-for-the-fuc*s-sake-can-i-save-my-data™ topic. But it still was not enough. This approach sort of relies on application having access to ```/sdcard/``` folder, which was not my case. But it provided nice guidance on how to approach this cocroach.

## What do you need
- your phone connected to PC
- adb installed (if you don't know what it is, try to google it)
- at least tiny linux experience (preffered but not necessary)

## What should you do
- take a beer (c'mon, you have one in a refigerator, don't you?)
- start command line
```console
$ adb shell # will give you access to your phone shell
$ run-as <app.package.name> # replace <app.package.name> with the name of you app package everywhere in code
$ cd /data/data/<app.package.name>/databases
$ ls -la # find out the name of files you need to transfer
$ chmod 666 <fileToBackup> # do this for all files you need to backup. Check other folders as well.
$ exit # go back to main shell of device
$ cp /data/data/<app.package.name>/databases/<fileToBackup> /sdcard/ # will copy file to internal SD storage (which is accessible via phone file manager, adb, PC, ...; make sure to copy all neded files - even from other folders than just *databases*)
$ exit # will exit adb shell on your device
$ adb pull /sdcard/<fileToBackup> ~/ # copy files one by one to your home directory
```
- Now you have (hopefully) all important data downloaded on your machine and you can uninstall app from device (make sure, that files are not empty, BTW)
- After you uninstalled app with old signature, succesfully installed version with new one and you need to have your data restored, it's going to be a bit more complicated
```
$ adb push ~/<fileFromBackup> /sdcard/ # push all the files back to device
$ adb shell # go to device shell
$ run-as <app.package.name> # login as your application
$ chmod 777 /data/data/<app.package.name> # change your app folder to be accesible from everyone, or you can play with users privileges, that's up to you
$ chmod 777 /data/data/<app.package.name>/databases # do same for databases folder
$ touch /data/data/<app.package.name>/databases/<fileFromBackup> # create placeholder files for backed up ones
$ chmod 777  /data/data/<app.package.name>/databases/<fileFromBackup> # make those files accesible as well
$ exit # go back to regular shell
$ cat /sdcard/<fileFromBackup> > /data/data/<app.package.name>/databases/<fileFromBackup> # copy each and every file you made backup of; cp might work as well, actually, you don't even have to create files by touch then, didn't try that though
$ run-as <app.package.name> again login as application
$ chmod 700 /data/data/<app.package.name> # fix privileges so only app can acces its data (unfortunately it seems there is no -r parameter)
$ chmod 700 /data/data/<app.package.name>/databases # do same for databases folder
$ chmod 700  /data/data/<app.package.name>/databases/<fileFromBackup> # and same for the files as well
$ exit # leave app shell
$ exit # leave device shell
```
- try to run application on device and check if all data were preserved. If not, you make something wrongly, or yours application differs from mine :)
