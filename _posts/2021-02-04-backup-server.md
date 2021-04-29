---
title:  Repurpose an Old Laptop to Ensure Your Data is Secure
date:   2021-02-04 17∶59∶46 +0300
tags: backup data-security linux windows
medium: https://ozymandiasthegreat.medium.com/repurpose-an-old-laptop-to-ensure-your-data-is-secure-d92fa7baf821
---

So you bought a new shiny laptop. It's fast, it's powerful, the only question remaining is what to do with your old one?

Selling would take a while and wouldn't bring in much value to speak of. It's much too slow to be of much use anymore.
And just throwing it out seems like a waste.

Well, you're in luck! Here's a perfect use for an old laptop,
that doesn't require much in a way of speed and processing power,
and brings priceless value:

<!--more-->

***Make it your backup server!***

A laptop is perfect for this purpose - it has a built-in UPS.
That's an uninterruptable power supply, of which a laptop battery is an example. That's very important for servers, and doubly so backup servers. In case of a power outage, it allows your server to
finish its' current operations and gently shutdown, ensuring no
data corruption can occur.

Another nice thing about a laptop is the screen and the keyboard.
While definitely not a necessity, in case of trouble it makes troubleshooting much, much easier.

And when I say an old laptop, I mean *old*. My backup server
runs on 13-year old ASUS X51L. It's not like I didn't have other laptops in the meantime, it's just that this beast is the most
reliable machine I've ever owned.

So without further ado, onto what you'll need.

## Prerequisites

* A router.
* An Ethernet cable.
* An old laptop.
* A large external hard drive.
* A USB stick.
* A Linux (or a Windows with OpenSSH setup) computer for configuring everything.

A few notes on requirements.

A router is a must, you want to have a home network for several reasons. First and foremost you *don't* want to expose your server
to the whole internet. It's fine to expose a single port for backups when you're away from home, but exposing everything requires configuring a firewall and locking down your server.
Which we will *not* cover in this article. So yeah, I'm assuming you're operating within a home network.

An external hard drive is not a hard requirement, in the sense that you can get by without it. Still, it's unusual for older laptops to have much space and internal hard drives are subject to heating related issues. So most likely you'll want at least 1TB external hard drive. Thankfully they're quite cheap these days.

A Linux computer is what I use daily, but since Windows includes OpenSSH these days, that works too. Unfortunately as of this writing Windows still ships with an outdated version of OpenSSH.
Read on how to work around that.

## Pre-Setup (Windows only)

> If you don't have administrator access to the Windows box, skip to the last paragraph of this section

Open a PowerShell window and paste the following commands one by one, pressing *Enter* after each and waiting for it to complete.

{% highlight powershell %}
Set-ExecutionPolicy RemoteSigned -scope CurrentUser
Invoke-Expression (New-Object System.Net.WebClient).DownloadString('https://get.scoop.sh')
scoop install -g win32-openssh
C:\ProgramData\scoop\apps\win32-openssh\current\install-sshd.ps1
Set-Service -Name ssh-agent -StartupType Automatic
Start-Service ssh-agent
{% endhighlight %}

The explanation: *scoop* is a package manager for PowerShell, we set it up to install the latest version of OpenSSH from GitHub so you don't have to mess with system files and permissions.
We enable the running of remote scripts for the current user so we can run the scoop installer.
Then we install OpenSSH, set it up, and enable the ssh-agent service.
Now we have a working ssh setup and so we're done here for now.

Now if you lack admin access, the above commands won't work and you're stuck using an outdated version of OpenSSH. Additionally, you can't start ssh-agent, which means for unattended backups to work the keys you generate later in the article need to be passwordless.
Other than that, you can still use this box to connect to the server and do automated backups.

## The Setup

First, we're going to set up a basic Ubuntu server. For this article, I'll be using Ubuntu 20.04 Focal Fossa. Yes, it's not the latest version, but it's the latest long-term support release and that's great. It'll make updating the server easier since normal
updates are usually faster and less error-prone than dist-upgrades and its' LTS status ensures we get security patches for a good long while.

### Basic Server

Go to [ubuntu.com](https://ubuntu.com/download/server) and choose "Manual Server Installation". Proceed to download the ISO and use your software of choice to make a bootable USB stick. One popular, cross-platform choice for this task is [etcher](https://www.balena.io/etcher/).

Boot your laptop (the old one) from the USB and let's walk through the installation.

If you've never installed an operating system or if you've only used graphical installers this will be a little different.
You'll get a wall of text that you can safely ignore until this comes up:

![Language selection](/assets/img/backup-server/1_iso_language_select.png)

Select your language and press *Enter*. If you're reading this article, you understand English, so I suggest you go with that.
You won't be accessing the interface often and keeping default language helps avoid inconsistencies in the configuration.

Now select your keyboard layout. This doesn't matter as much, but if your preferred keyboard layout lacks Latin characters go with English (US) instead.

![Keyboard layout](/assets/img/backup-server/2_iso_keyboard_select.png)

Select your network interface. At this point, I should mention that you really want a wired network for your server. Even if all your devices connect to the router through WiFi, you want an Ethernet cable connecting your server to your router.

A bit of an explanation: when both your backup server and client (your primary computer) are connected to the network through WiFi, the speed of the connection is halved. That means slower backups.

Another thing to keep in mind is that setting up WiFi in the bootloader is much more complicated than a wired connection.
Wired connections usually work out of the box, while WiFi requires additional software and configuration.
You'll see why this is important later in the article.

![Networking](/assets/img/backup-server/3_iso_network_select.png)

If you plan to make backups through the Internet and you're connecting to the internet through a proxy, setting it up now is a good idea.

For the sake of simplicity, I'm leaving this config blank.

![Proxy](/assets/img/backup-server/4_iso_proxy_select.png)

Now select package archive to download software packages and updates from. In the vast majority of cases, the Ubuntu installer will select the correct package archive based on your locale, but sometimes you might want to select something physically closer for speedier updates.

![Package archive](/assets/img/backup-server/5_iso_archive_select.png)

Now select your disk for installation. If your laptop contains more than one disk, such as SDD and HDD, you probably want to select the faster one for performance.

Also, make sure to set up LVM and select "Encrypt the LVM group with LUKS". Set a strong passphrase and note it down in your password manager (you are using a password manager, right?).

As this is going to be a backup server, and as such, contains a copy of all of your sensitive data, you really want to use encryption.

![Disk selection](/assets/img/backup-server/6_iso_disk_select.png)

Now you'll get to the overview screen where you can confirm one last time that everything is configured correctly.

![Overview](/assets/img/backup-server/7_iso_overview.png)

This is the last important step, create a user and set the hostname for your server. You may use the same password as you used for the disk since  I don't see a need to remember 2 passwords for a single machine/user.

![User screen](/assets/img/backup-server/8_iso_user_info.png)

You'll get offered to install the ssh server now. Do accept, cause we'll be doing most of our configuration over ssh.

![ssh offer](/assets/img/backup-server/9_iso_ssh.png)

The next screen offers popular server software, but as we don't need any of it, you can just skip it.

Now, wait for the installation to complete, select reboot, remove the USB stick when prompted and wait a bit to boot into your fresh server.

This is the part where having a screen and a keyboard comes in useful. Since we set up encryption, the boot process cannot complete without unlocking the disk.
We'll fix this by enabling remote unlocking soon, but for now, just enter the passphrase you set up for the disk.

You'll be dropped into a terminal prompt. Enter the user name you set up and the password when prompted.
You'll see a welcome message containing system information, ads for Canonical services, and some info about available updates.

First, we want to update. Type `sudo apt update && sudo apt upgrade` and press *Enter*. When prompted to confirm type "y" and press *Enter*. Now, wait a while for the updates to complete.

Now we can set up remote unlocking.

* First install *dropbear-initramfs*, you'll get a warning about *authorized_hosts* but you can ignore it for now.
  * `sudo apt install dropbear-initramfs`
  * Now edit dropbear configuration by entering `sudo nano /etc/dropbear_initramfs/config`
    * Find line `# DROPBEAR_OPTIONS =` and uncomment it by removing "# " in front. Then put this after the = sign: `"-p 2244 -s -j -k"` .
    * press *CTRL-o* and *Enter* to save and *CTRL-x* to exit nano.

Let's take a break here and explain. dropbear is a minimal ssh server that can run entirely from RAM and will allow us to connect to the bootloader environment remotely.
The options we put in the config have the following meaning:

* `-p 2244` We change the default port.
* `-s` We disable the password login.
* `-j` and `-k` We disable port forwarding.

Now we need to set up an RSA key pair if we don't already have it since we disabled password login. If you already have RSA keys set up on your primary computer, skip to the next paragraph.
On your primary computer run `ssh-keygen`, when prompted for the path, just press *Enter* to accept the default, enter a strong passphrase twice (or no passphrase if you lack admin access on Windows). Then run `ssh-add` to add your new key to the ssh-agent (You can skip this step if you're on Windows and lack admin access). Enter the passphrase when prompted. ssh-agent will remember the passphrase for you so you don't have to type it again for this user.

Let's add the public key to the `authorized_keys` file so we can log in. Now, this is best done by logging in to your server from your primary computer. This will be the computer you use to control and configure your server and the only machine you can restart your server from. (You can always restart your server physically since it has a screen and a keyboard, but who wants that?)

On your server execute `ip address`, you'll see something like this

![ip command](/assets/img/backup-server/ip_address.png)

Find the line that says "link/ether" and look to the next line,
you'll see your server's IP address, mine's in this case is 10.0.2.5.
On your computer open the terminal. Connect to your server by executing `ssh ozymandias@10.0.2.5`.
Replace "ozymandias" with the user name you set on the server and the IP address with the address you got from the `ip` command.
You'll be prompted for the password, that's fine, we only disabled password logins for the bootloader - not the server itself.

In the ssh prompt execute `sudo nano /etc/dropbear-initramfs/authorized_keys` and enter the following

{% highlight bash %}
no-port-forwarding,no-agent-forwarding,no-x11-forwarding,command="/bin/cryptroot-unlock" <paste the contents of id_rsa.pub here>
{% endhighlight %}

You'll find `id_rsa.pub` in `~/.ssh` (`C:\Users\<your username>\.ssh` on Windows). To view contents quickly just run `cat ~/.ssh/id_rsa.pub`. Note that you have to run this command on your primary computer outside the ssh prompt. Just open a second tab/window of the terminal, run this command and copy the long random string it outputs.

Then in nano, again, press *CTRL-o* and *Enter* to save and *CTRL-x* to exit.
Then execute `sudo update-initramfs -u` and wait for it to complete. If you did everything correctly at this point we can restart the server remotely via ssh. Execute `sudo systemctl reboot` and wait a few minutes. Since we installed updates as well, the reboot might take a while.

Try to connect to your server with `ssh -p 2244 root@<your server's ip address>`

![ssh into bootloader](/assets/img/backup-server/ssh_boot.png)

You'll get a warning about authenticity since we haven't connected to the bootloader before. Type "yes" and press *Enter*.
Now you can enter the disk password, at which point you'll get a line about success and the connection will automatically close.
Wait a minute or so and you can log in to your server.

For the final touches, let's enable a passwordless login. On your primary computer (where you generated your key pair) execute `ssh-copy-id <username>@<server's IP address>`.
Enter your password when prompted and once the command completes,
try to login to your server: `ssh <username>@<server's IP address>`. You should be able to log in without a password now!

Now to disable password and root logins completely, on your server's ssh session execute `sudo nano /etc/ssh/sshd_config`.
Find these lines and change values as follows:

* *PermitRootLogin* uncomment and set to *no*
* *PasswordAuthentication* uncomment and set to *no*
* *ChallengeResponseAuthentication* make sure it's set to *no*
* *UsePAM* set to *no*

Save and close, then execute `sudo service ssh restart`, log out and log back in.

Congratulations, we've enabled remote unlock and secure shell access. Now your backup server is secure, but you won't have to touch it physically unless something goes horribly wrong.

> If you have multiple computers you plan to backup, you may want to delay disabling password login until you set them all up.
> This will make the setup easier, but for guaranteed security *DO NOT FORGET TO DISABLE PASSWORD LOGINS*

#### Prevent Hibernation on Lid Close

One little thing you'll likely want to do as well is to disable sleep/hibernation when your server's (laptop's) lid is closed.
I mean, if it's sleeping we can't connect to it or perform backups. To do this, first, run `sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target`.

This would be it, but disabling sleep may cause high CPU usage when the lid is closed. I *think* it's a bug in Ubuntu that hasn't been fixed yet. To avoid trashing your CPU and fans run `sudo nano /etc/systemd/logind.conf` and edit the following lines as so:

{% highlight bash %}
HandleLidSwitch=ignore
HandleLidSwitchDocked=ignore
{% endhighlight %}

### The External Drive

Let's set up the external drive (or if your laptop contains 2 drives such as SSD and HDD and your HDD is sufficiently large, the HDD). First, connect it to the server and turn it on. Now let's go back to your primary computer and ssh into the server.

Run `lsblk` to see all disks and partitions. Find the one which says "disk" and the size matches your HDD, note the first column.
This is the device identifier and we'll use it to repartition the disk, format it, and encrypt it. Mine (and quite likely yours too) is "sdb".

Now before you proceed, make sure the disk doesn't contain anything you'd regret deleting, the next operations WILL DESTROY data. It might still be recoverable with something like [photorec](https://www.cgsecurity.org/) but that's not guaranteed.

All good? Then run `sudo sfdisk --delete /dev/sdb`. This will delete all partitions on the disk, so we can make one disk sized partition for storing backups.

![Delete partitions](/assets/img/backup-server/sfdisk_delete.png)

To create a partition run `echo ',,,' | sudo sfdisk /dev/sdb`.

![Create partition](/assets/img/backup-server/sfdisk_create.png)

Let's encrypt and format the newly created partition. Run `sudo cryptsetup -y luksFormat /dev/sdb1`. Replace "sdb1" with your device identifier and partition number. This will encrypt the partition, the "-y" flag makes the command prompt you for a passphrase. Again you *may* use the same passphrase you used for the system disk and your user account. Since we'll set up automatic mounting, it doesn't make sense to use a different passphrase because anyone with access to your server will have access to your data anyway. Now mount the encrypted partition with `sudo cryptsetup luksOpen /dev/sdb1 sdb1_crypt` and format it with `mkfs.ext4 /dev/mapper/sdb1_crypt`.

![Encrypt partition](/assets/img/backup-server/luks_setup.png)

Now let's set up a key file for automatic mounting at boot.
Run `sudo dd if=/dev/urandom of=/root/.keyfile bs=1024 count=4`.
This will create a 4KB file with random data we'll use as a key.
Change its' permissions so it's only accessible by root with `sudo chmod 0400 /root/.keyfile` and add it to your disk with `sudo cryptsetup luksAddKey /dev/sdb1 /root/.keyfile`. Again, replace "sdb1" with your device and partition number.

![Add keyfile](/assets/img/backup-server/luks_add_key.png)

To decrypt your disk at boot you need to edit `/etc/crypttab`.
Rub `sudo blkid` to find your disk UUID, it's the line that starts with `/dev/sdb1`. Copy the UUID value and run `sudo nano /etc/crypttab`. Create a new line that looks like this, replacing UUID with what you copied:

{% highlight bash %}
sdb1_crypt UUID="b09de769-e102-42d0-87fc-08dee2df1e0e" /root/.keyfile luks,discard
{% endhighlight %}

Save and close. Now edit `/etc/fstab` with `sudo nano /etc/fstab`:

{% highlight bash %}
/dev/mapper/sdb1_crypt  /media/data  ext4   defaults  0  2
{% endhighlight %}

Reboot, check that `/media/data` is available with `ls -ld /media/data/` and that it's size is correct with `df -h /media/data/`.
If everything looks good, we just need to take ownership of the "data" directory and we're done with server setup. Do this with `sudo chown <username>:<username> /media/data`.

![Mount point](/assets/img/backup-server/mountpoint.png)

### The router

Now we need to set up the router. At the very least you want to assign a static internal IP to the server so you can easily connect to it. If you want to back up over the internet, you also need to set up port forwarding.

Unfortunately, every router is quite different. Because of that, we'll cover [DD-WRT](https://dd-wrt.com/) which is an open-source alternative router firmware. The steps you need to take will probably differ but should be similar enough.

First, log in to your router. The IP you need to enter into your browser will differ based on your router model and router settings but you can google that.

![DD-WRT control panel](/assets/img/backup-server/dd-wrt_cp.png)

To set up a static IP switch to the Services tab and scroll to the DHCP block.

![DD-WRT static IP binding](/assets/img/backup-server/dd-wrt_dhcp.png)

Click the Add button, enter your server's MAC address, its' name, and the IP you want it to have. You can find your server's MAC address by ssh'ing into it and running `ip address` again. Right after the link/ether goes your server's MAC address in the form of xx:xx:xx:xx:xx:xx.

If you don't plan to make backups outside your home network, we're done. Else, move on to NAT/QoS tab. You'll be dropped into port forwarding configuration by default.

![DD-WRT port forwarding](/assets/img/backup-server/dd-wrt_port_forwarding.png)

Again, click the Add button. Enter a name for this port to make telling it apart easier. Choose TCP as the protocol. Leave the next field blank. Choose the port you'll connect to. Pretty much any port you can remember will do here, just don't use the default ssh port (22). Enter your server's internal IP address. It's the one you set in the previous step. Enter the port on the server we'll be connecting to, which is 22 since we'll be doing everything over ssh.

To configure any additional ports just follow the last paragraph.
And we're done here.

## The clients

Now that our server is set up, we need to also set up our clients to back up to the server. Clients, in this case, refer to your computers and phones, as well as tablets and any digital device you can reasonably expect to back up. We'll cover non-Mac computers and Android phones here.

### Windows Client

Remember when I said we're done with the server? I lied. I'm sorry but finding reliable (that means well tested and preferably open source) backup software for Windows turned out to be trickier than I expected. We'll be using *rdiff-backup* which is cross-platform, open-source, and actively used and maintained for 20 years or so. Unfortunately, it's command-line only and requires installation on both client and server.

Its' other benefits are fast incremental backups, backups over ssh (and we already set that up), and a transparent storage scheme, meaning you can just open the backup folder and browse old versions of your files. This makes partial restoration easy and since no proprietary formats are used, if you find a software you like better, migration should be fairly easy.

First let's install it on the server, start up ssh, and once logged in run `sudo apt install rdiff-backup`.
That's it. Since it's in the Ubuntu repositories and the version there is sufficiently recent, this all we need to do.

Now on your Windows computer, first let's check processor architecture. If it's a recent computer and it came with Windows you're pretty much guaranteed to be running 64 bit OS.
But double-checking doesn't hurt, so go to Settings app >> System >> About. Check System Type line. In case you're running 32 bit OS (why?) go to [rdiff-backup Github releases page](https://github.com/rdiff-backup/rdiff-backup/releases) and download "rdiff-backup-2.0.5.win32exe.zip". If you're on 64 bit OS, you need to go to [this issue](https://github.com/rdiff-backup/rdiff-backup/issues/494#issuecomment-748511757) and download linked file, since official 64 bit builds aren't available yet.

Now create a new directory somewhere, I'll be doing it in the root of the C: drive so I don't have to type long paths. Let's call it "rdiff-backup". Extract "rdiff-backup.exe" from the zip you downloaded to this directory. Then create a new text file and call it "rdiff-backup.bat". Note you may need to enable the display of file extensions in the Explorer options for this to work.
Since Windows determines file type based on extension, you won't be able to run the backup script if it doesn't end in "bat".

Open "rdiff-backup.bat" in Notepad and paste the following:

{% highlight batch %}
C:\rdiff-backup\rdiff-backup.exe -v5 -b --exclude-globbing-filelist "%~dpn0.txt" %1 %2 >> C:\rdiff-backup\rdiff-backup.log 2>&1
{% endhighlight %}

Adjust the paths as needed. Then create another text file and name it "rdiff-backup.txt". This one is the exclude list. All the paths and globs in it will be excluded from backups. I recommend putting your Downloads directory here at least since it's usually fairly large and once you decide to keep a file, you'll probably move it somewhere else.

> The paths in exclude list don't support backslashes. Replace them with regular slashes, e.g.:
> C:\Users\Ozymandias\Downloads becomes C:/Users/Ozymandias/Downloads

*CTRL+SHIFT+Right click* directory background and select Open PowerShell here. Then type `.\rdiff-backup.bat C:/Users/<your Windows username> <your server username>@<your server's IP address>::/media/data/<Windows computer name>/<Your windows username>` and run it.
Now this will take a while depending on how many files you have.
Don't worry, subsequent backups will be much faster since they'll only back up modified files. Go have a cup of coffee or watch a movie, once the command completes, check that there aren't critical errors, and we're good.

Now typing this command every day to backup would be quite a pain, so let's automate our backups. Open the Start menu and find Task Scheduler. Once it loads, click Create Task... You'll get this dialog:

![New task dialog](/assets/img/backup-server/1_tasksched_new_task.png)

Configure this screen like in the screenshot and click triggers.

> If you don't have administrator access on this machine, select
> Run only when user is logged on

![Task triggers](/assets/img/backup-server/2_tasksched_new_task.png)

Click New... and configure as follows and click OK.

![New trigger](/assets/img/backup-server/3_tasksched_new_task.png)

On to the Actions tab.

![Task actions](/assets/img/backup-server/4_tasksched_new_task.png)

Again, click New... and configure as follows.

![New action](/assets/img/backup-server/5_tasksched_new_task.png)

Now, this dialog is non-resizable so I can't show the arguments field completely.
There are 2 arguments (the %1 and %2 in the script), separated by space. The first is the directory you want to backup, most likely your User directory. For me it "C:/Users/Ozymandias". The second is the directory on the server where to store the backup.
Like we ran manually it's `<your username on server>@<server's IP address>::/media/data/<Windows computer name>/<your Windows username>`. For me it's "ozymandias@192.168.1.102::/media/data/Win10/Ozymandias".

Lastly, configure conditions in the Conditions tab and click OK.

![Task conditions](/assets/img/backup-server/6_tasksched_new_task.png)

Now one last step. rdiff-backup does not automatically clean old backups, so your backup directory might get out of hand. To avoid that let's set up another scheduled task that runs daily to remove backups let's say older than 3 months.

Repeat the task creation steps, just set the time to say midnight (we set the backup to run at 10 PM) and the action to this:

![Clean up action](/assets/img/backup-server/tasksched_cleanup.png)

Again, the arguments aren't clearly visible, so here they are:
"--remove-older-than 3M \<your backup directory's path\>".
For me it's "--remove-older-than 3M ozymandias@192.168.1.102::/media/data/Win10/Ozymandias". Do note the capital M and that we're running rdiff-backup.exe, not the batch file.

Congratulations! You've successfully set up automated daily backups of your Windows computer.

### Linux Client

You can use rdiff-backup on Linux as well. It works and it works arguably better than it does on Windows. However, since something just as powerful and exceedingly simple is available for Linux I prefer to use that.

I'm talking of course about Back In Time. It's a graphical application written in Python and QT that uses rsync for its' file operations. It also stores snapshots as a transparent versioned mirror of the source file system, but it hard-links unchanged files minimizing disk space usage.

Back In Time recommends installing from PPA but as of this writing the PPA hasn't been updated for Focal Fossa, much less Groovy Gorilla. Fortunately, Ubuntu archives contain a recent version, so to install just run `sudo apt install backintime-qt4 sshfs`.

On the first run, you'll be prompted to restore the configuration. Since we're setting up for the first time do decline. You'll be presented with a profile configuration dialog like this:

![Back In Time profile config](/assets/img/backup-server/1_backintime_config.png)

Select mode SSH, don't bother with encryption. Back In Time supports transparently encrypting your backups with EncFS but EncFS has long-standing bugs that make it not a secure option.
And since we used Luks encryption on the server this is irrelevant anyway.

The host is your servers' IP address, the port is most likely 22, user - your username on the server, the path is `/media/data` if you followed this tutorial, leave cipher unchanged and select your private key. That's the one that DOESN'T end in .pub.

If you set the passphrase for the key pair enter it in "SSH private key" and check "Save Password to Keyring". The keyring is secure storage for sensitive information, it will keep your password encrypted until you log in and then make it available to Back In Time so you don't have to enter it every day.

Now in the Advanced section enter your computer's name, your username on this computer and you can leave the profile as 1.

Do choose a schedule, I chose Every Day at 22:00. This will create a cron job for Back In Time that will run unattended, so you can just forget backups until you need to restore something.

Next the Include section. For the sake of simplicity, you can just choose your home folder and be done with it.

![Back In Time includes](/assets/img/backup-server/2_backintime_config.png)

The exclude section already contains quite a few entries. These are large directories that you really don't want to back up. Leave it as is, maybe add your Downloads folder, that's it.

![Back In Time excludes](/assets/img/backup-server/3_backintime_config.png)

The Auto-remove section is probably the biggest advantage Back In Time has over rdiff-backup. You can configure the automatic removal of old snapshots and not worry about it.

![Back In Time auto-remove](/assets/img/backup-server/4_backintime_config.png)

Uncheck "Older than" and do check "Smart remove". Configure which and how many snapshots you want to keep according to your preference and available disk space.

You can leave "Options" and "Expert Options" tabs as is, in the case of "Expert Options" it's better not to mess with. Click OK and you'll be brought to the main interface.

![Back In Time main window](/assets/img/backup-server/backintime.png)

Here you can browse existing snapshots, take new snapshots and do a full restore. This is it, at 22:00 Back In Time will run, and tomorrow, and the day after. Your data is secure now.

### Android client

Android is different from desktop operating systems in a lot of ways, but the main issue for our purposes is there are no SFTP clients with automated sync. Well, that's not entirely true. There's [FolderSync](https://play.google.com/store/apps/details?id=dk.tacit.android.foldersync.lite) but it contains ads and I don't feel comfortable trusting my sensitive data to ad-supported software.

Instead we'll set up [Syncthing](https://syncthing.net/). It's free as in beer, free as in speech, well tested, secure, and it even supports some basic file versioning.

First, install it on the server and get it running. To do that execute following commands:

* `sudo apt install apt-transport-https`
* `curl -s https://syncthing.net/release-key.gpg | sudo apt-key add -`
* `echo "deb https://apt.syncthing.net/ syncthing stable" | sudo tee /etc/apt/sources.list.d/syncthing.list`
* `sudo apt update && sudo apt install syncthing`
* `sudo systemctl enable syncthing@<your username>`
* `sudo service syncthing@<your username> start`

Now, to set it up. On your primary computer run `ssh -N -L 8384:127.0.0.1:8384 <your server's username>@<your server's IP address>`. This will forward connections to your computer's 8384 port to your server's 8384 port. If you get a message that port 8384 is already bound, just change the first 8384 to any number between 8000 and 8999.

![syncthing interface](/assets/img/backup-server/syncthing_initial.png)

Open [localhost:8384](http://localhost:8384) in your browser.
Then click Actions >> Settings.

![syncthing settings](/assets/img/backup-server/syncthing_settings.png)

Change Default Folder Path to `/media/data/syncthing` or whatever is the path to your external disk. Then switch to the GUI tab.

![syncthing GUI tab](/assets/img/backup-server/syncthing_settings_gui.png)

Enter a username and a strong password. It's also a good idea to note down the password in your password manager. You may also set the theme to something easier on the eyes. Now, click Save. The page will reload and you'll be prompted for the username and password you just set up.

You may also want to remove the Default Folder now since we don't plan on storing files on the internal disk. To do that click on Default Folder to expand it, then Edit >> Remove. Confirm and we're done with the server for now.

On the Android side, we'll be using [Syncthing-Fork](https://play.google.com/store/apps/details?id=com.github.catfriend1.syncthingandroid). It also [available on F-Droid](https://f-droid.org/en/packages/com.github.catfriend1.syncthingandroid/) and it's a good idea to set that up if you plan to also back up apps (app backup requires root though).

Install and open it. Then click Add Folder button in the top right of the interface. For this example, we'll be setting up the camera folder (DCIM), but the steps are the same for any other location. Also note, if you use something like [Google Photos](https://play.google.com/store/apps/details?id=com.google.android.apps.photos) or [Nextcloud](https://nextcloud.com/) to continuously upload your photos and free up space on your device, using syncthing to backup your camera folder doesn't make sense even with file versioning, because once the photos are deleted from the phone the changes will be propagated to the server.

![Syncthing-Fork Edit Folder](/assets/img/backup-server/syncthing_fork_add_folder.png)

Enter the name of the folder. This doesn't much matter, it's only here so you know which folder you're working with. Then select the folder path. Do nothing with devices for now. For the Folder Type, I suggest you choose Send Only because we won't be making changes server-side. Do make sure Watch for changes is ON. Now select the versioning scheme and we're done. If you only transfer your photos manually choose Trashcan versioning with a sufficiently large Cleanout window to recover deleted files. Otherwise, if you clean out this folder more often, choose Simple scheme with something like 3 versions to keep per file.

![Syncthing-Fork add device](/assets/img/backup-server/syncthing_fork_add_device.png)

Now, switch to the Devices tab, and in the top right tap the Add Device button. On your computer, where you have syncthing web interface open, click Actions >> Show ID. On your phone click the QR code button in the right of the top row of the Add Device screen. Grant the Camera permission and scan the QR code on your computer's screen. Enter the name for the Device, that's your server and I named it humpty. Choose folders you want to sync.
Save your changes by tapping the checkmark button at the top.

![Syncthing accept device](/assets/img/backup-server/syncthing_accept.png)

Back on your computer, close the ID screen and you should see a notification about adding a device. Click add, switch to Sharing tab in the dialog that pops up, and mark Auto Accept before saving. This is so you don't have to go back to the web interface when adding new folders. That's it, now you can close the web interface. We won't be going back to it unless something goes wrong.

On your phone, configure any additional folders you want to back up, paying attention to the versioning scheme you choose and selecting your server in the devices section.

#### Backing up Apps

You'll need to root for this, no way around it. There are backup solutions that claim to work without root and they fail on restore more often than not. Especially if you want to restore a backup on a new device for a seamless upgrade, these apps will fail you.

Rooted app backup solutions boil down to [TitaniumBackup](https://play.google.com/store/apps/details?id=com.keramidas.TitaniumBackup) and [OAndBackupX](https://f-droid.org/en/packages/com.machiav3lli.backup/). These apps are pretty similar in what they do, with TitaniumBackup being older and theoretically more powerful, with a really horrible interface, and OAndBackupX being open source, easier to use, and judging from online reviews - more reliable when restoring. Personally, I've had great success with both of these apps, whether I'm restoring a backup on the same device after flashing a new ROM or setting up a new device from a backup.

Since OAndBackupX is open-source, it's what we'll cover in this article. Alas, it's only available on [F-Droid](https://f-droid.org/), so you'll have to set that up.

Another thing to keep in mind is that most Android apps cannot be backed up. Or rather, restored. If an app depends on a remote server to function and/or uses encrypted keystore to store credentials, it will not function upon restore. There's really nothing you can do about this, and to save time and battery, better don't even try to back up these apps. Examples would be most Android games, Facebook, and Nextcloud.

With that out of the way, we're ready to back up some apps. When you open OAndBackupX, you'll be presented with this:

![OAndBackupX home](/assets/img/backup-server/oandbackupx_home.png)

Firstly, note the little "i" in the top right. By clicking on it, you'll get a lot of links to learn in-depth about this app and ways to use it. The next thing of note is the action bar at the bottom of the screen. Click the cog in the action bar to access settings.

![OAndBackupX settings](/assets/img/backup-server/oandbackupx_settings.png)

You'll do alright with defaults, but you'll want to change the location of backups. For that tap User preferences.

![OAndBackupX User preferences](/assets/img/backup-server/oandbackupx_folder_selection.png)

Now tap the Backup folder and choose a location on your *internal* SD card. You'll want an internal SD card to avoid permission issues, or you can format your external SD card as internal storage.

Next, go back to OAndBackupX's home screen. On the action bar at the bottom tap the calendar-looking icon to schedule a backup.

![OAndBackupX scheduled backups](/assets/img/backup-server/oandbackupx_new_schedule.png)

Tap the red button that looks like a new alarm. This will create a new scheduled backup titled All apps. Tap on this entry to edit it.

![OAndBackupX scheduled backup edit](/assets/img/backup-server/oandbackupx_schedule.png)

Choose when you want the backups to happen. Some time at night when you're not using the phone is a good idea. Leave the interval as 1 day to have backups every day. Leave the filter as All apps. Set the Backup mode as APK and Data. Tap CUSTOM LIST to select which apps to backup. Then mark Enable toggle and we're done.

Now, every night the apps you chose will be backed up to a folder you specified, and if you set up Syncthing to sync that folder,
synced to your server.

## Bonus: Back up Your Online Accounts

Now that all your devices are backed up, you probably still have a lot of data stored in the cloud. You may think it's safe. It's almost certainly backed up. However, what if you get locked out of your account? Hacked? Or simply the cloud provider messes up big time, or worse - goes down? It's a good idea to have a local copy of your cloud data.

Alas, not all cloud providers provide an easy way to export your data. Much less the means to this automatically. I'm looking at you Facebook and Twitter. They only offer archives that take forever to generate and can only be downloaded for a limited time through a link sent to your email. This is sub-par, to say the least. On the other hand, Google and some other cloud providers offer most if not all of your data through open, free APIs that can be easily automated. We'll focus on these.

### Cloud Storage

We'll be using [rclone](https://rclone.org/) to sync our Google Drive to a local directory. It's a one-way sync, but for backup purposes, this will do great. Do note that rclone supports many more cloud providers than just Google. If you use Dropbox or OneDrive, they can be synced as well. For the sake of brevity, we'll focus on Google Drive since it's one of the most popular and one of the most complicated to set up.

![Google API Console](/assets/img/backup-server/google_api_console.png)

Before we begin, go to [Google API Console](https://console.developers.google.com/) and create a new project. I suggest you name the new project after your server so it's easy to remember.

![New Project](/assets/img/backup-server/google_api_console_new_project.png)

Click ENABLE APIs AND SERVICES, search for Drive, and enable "Google Drive API". Then click Credentials in the sidebar.
Now we need to configure OAuth Consent Screen. This is something you need to do once and it doesn't much matter because we'll be the only ones using these APIs. Click the "CONFIGURE CONSENT SCREEN" button near the top right. Select "EXTERNAL" and click "CREATE". Enter the application name, I suggest you use the project (server) name. Select contact emails as these are required, just enter your email. Again, it doesn't really matter as you'll be the only user. Click "SAVE" and then click "OAuth consent screen" in the sidebar. This is very important - click "PUBLISH APP". Dismiss the pop-up and then click "Credentials" in the sidebar again.

Now click the "CREATE CREDENTIALS" button at the top. Select OAuth Client ID. Select "Desktop app" and enter rclone as the name, then click Create. You'll get a pop-up with your client ID and client secret. Leave it at that for now, we're ready to set up the server.

ssh into your server. Execute `curl https://rclone.org/install.sh | sudo bash`. Now run `rclone config`. Choose "n" for new remote and enter a name. I'll be using "gdrive". Enter "drive" for Google Drive. Now paste the client ID we got from the Google API console and press "Enter". Do the same for client secret. Choose 1 as the scope. Leave "root_folder_id" blank. Leave the "service_account_file" blank as well. Now, for the advanced config.

Normally you shouldn't need to edit these values with the exception of Google Docs formats. By default rclone exports Google Docs as Microsoft Office documents. If instead, you want them in the Open Document format, press "y" to edit the advanced config. Leave all values as defaults. When prompted for export formats enter "odt,ods,odp,svg" and proceed to leave the rest as default too.

When prompted to use auto config choose "n" for no since we're working on a remote machine. You'll get a rather long URL, copy and paste it into your browser.

![OAuth warning](/assets/img/backup-server/google_oauth_warning.png)

You'll get a very scary warning, don't worry about it. It's only here because we haven't submitted the app for verification and we don't really need to go through that hassle. Click Advanced and then "Go to \<app name you entered earlier\>". Agree to permission requests and when you get a verification code, copy it. Now paste it into your terminal. Press "Enter" to refuse to configure as Team Drive, press "Enter" again to confirm everything is OK, and then enter "q" to quit rclone configuration.

Now to create a directory where we'll store Google Drive backup execute `mkdir -p /media/data/Google/Drive`. Let's run initial sync with `rclone sync gdrive:/ /media/data/Google/Drive/`.
This will take a while depending on the size of your Google Drive.
Subsequent syncs will be much faster because they'll only download changes.

When the command completes, we want to set up some automation.
Run `crontab -e` and when prompted select nano as the editor.
You only need to do this once, subsequent runs will drop you straight into nano. Scroll to the end of the file and enter the following `0 */1 * * * rclone sync gdrive:/ /media/data/Google/Drive >> /home/ozymandias/rclone.log 2>&1`. Explanation: cron is a daemon that runs specified commands at specified intervals. `0 */1 * * *` means run every hour. The command is rclone sync we already ran. The `>> /home/ozymandias/rclone.log` redirects the output of the command to a log file. Do replace "ozymandias" with your user name. Finally, `2>&1` concatenates errors and standard output into the same stream we redirect to the log file. Do check this log file sometimes to make sure everything is working.

### Google Photos

Since Google Photos got decoupled from Google Drive, backing them up is a bit of a pain in the behind. We could use rclone to do this as well since recent versions of rclone have support for the new API. However, rclone would only back up the files, without the metadata and your Google Photos creations.

Instead we'll use [gphotos-sync](https://github.com/gilesknap/gphotos-sync). It will back up pretty much all of Google Photos data, and since it can only download there's no risk of messing up your library.

Again, this app uses OAuth to authorize with Google, so we need to create a client ID and client secret for it. We also need to enable Photos Library API for our project.

In Google API console click Dashboard in the sidebar, then ENABLE APIs AND SERVICES, and search for Photos Library API. Enable it.

In the Credentials section click CREATE CREDENTIALS, select "OAuth client ID" and then select "Desktop app". Enter "gphotos-sync" as the name and click CREATE. You can close the pop-up because for this app we'll be downloading formatted credentials file.
In the "OAuth 2.0 Client IDs" section, on the line that says "gphotos-sync" click the download button (the downwards facing arrow). Save the file as "client_secret.json" in your downloads directory.

Now we're ready to install and authorize gphotos-sync. Let's create a directory where we'll store Google Photos data by running `mkdir -p /media/data/Google/Photos`. Then run `sudo snap install gphotos-sync` to install the app. Run `sudo snap connect gphotos-sync:removable-media` to enable access to the external hard drive. Now, run `gphotos-sync` without arguments once to create and symlink the snap directories. Create the config directory with `mkdir -p ~`. Then on the computer where you downloaded the credentials open a new terminal in your downloads directory and execute `scp client_secret.json <your username on the server>@<your server's IP address>:/snap/gphotos-sync/current/.config/gphotos-sync`.

To authorize and perform initial sync run `gphotos-sync /media/data/Google/Photos`. Once again you'll get a long URL you need to copy and paste into your browser. And once again you'll get a scary warning. Click Advanced and proceed to authorize the app.
When you get the authorization code, copy and paste it into your ssh session. Now, go make a cup of coffee while all your photos are downloaded.

Once you enjoyed your coffee and the command completed, let's automate this for the future. Again, we'll do this with a cron job. Run `crontab -e`, scroll to last line and enter `15 */1 * * * gphotos-sync /media/data/Google/Photos >> /dev/null 2>&1`. Explanation: we've set it to run 15 minutes past every hour. Since gphotos-sync keeps log in the destination directory, we redirect its' output to /dev/null, i.e. we discard it.

### EMail

If you use a desktop email client, you can probably skip this step since your emails will be included in the desktop backup. Otherwise, read on. We'll use the mbsync utility included in the isync package to download our emails via IMAP to a local directory. This package is in the Ubuntu archives, so to install it just run `sudo apt install isync`.

Now create a file called ".mbsyncrc" in your home directory on the server and put the following in it. To do that run `cd ~ && nano .mbsyncrc`.

{% highlight bash %}
IMAPAccount     ozymandias
Host            imap.gmail.com
User            <your username>@gmail.com
Pass            <your password*>
SSLType         IMAPS
CertificateFile /etc/ssl/certs/ca-certificates.crt

IMAPStore gmail
Account   ozymandias

MaildirStore local
SubFolders   Verbatim
Path         /media/data/Google/GMail
Inbox        /media/data/Google/GMail/Inbox

Channel   ozymandias
Master    :gmail:
Slave     :local:
Patterns  *
Create    Both
SyncState *
{% endhighlight %}

> You really shouldn't put your password in plain-text files.
> Instead enable 2-factor authentication and create an app password for this.

You'll also need to enable IMAP in the Gmail settings. In Gmail click the cog in the top right >> See all settings >> Forwarding and POP/IMAP, select Enable IMAP and click Save changes.

Let's create the mail directory with `mkdir -p /media/data/Google/Gmail` and run initial sync with `mbsync --all`. Once it completes let's make a cron job for this task too. Again, run `crontab -e`, scroll to last line and put `30 */1 * * * mbsync --all >> /home/ozymandias/mbsync.log 2>&1`. This time the cron line should already be pretty clear. We're running mbsync 30 minutes past every hour and saving log in our home directory.

We used Gmail here, but with minor changes to the .mbsyncrc, you can use any mail provider that supports IMAP. Which in this day and age should mean all of them.

### Calendar and Contacts

Last but not least we're going to back up our calendars and contacts. For this task, we'll use a small Python utility call [vdirsyncer](http://vdirsyncer.pimutils.org/en/stable/). It supports Google, iCloud, and many more providers as long as they provide their data over CalDAV and CardDAV protocols. Again, for the sake of this article, we'll set up Google Calendar and Google Contacts backup.

First, go to Google API console, click ENABLE APIs AND SERVICES, search for CalDAV API and Google Contacts CardDAV API, and enable them both. Then, in the Credentials section create credentials of type OAuth client ID, select Desktop app, and enter "vdirsyncer" as the name.

Then, install vdirsyncer with `sudo apt update && sudo apt install vdirsyncer python3-requests-oauthlib`. Create configuration directory - `mkdir -p ~/.vdirsyncer`. Now, let's create a config file with `nano ~/.vdirsyncer/config`. Put the following in the config file, replacing \<client ID\> and \<client secret\> with values you got from Google API console:

{% highlight bash %}
[general]
status_path = "~/.vdirsyncer/status/"

[storage local_calendar]
type = "filesystem"
path = "/media/data/Google/Calendar"
fileext = ".ics"

[storage local_contacts]
type = "filesystem"
path = "/media/data/Google/Contacts"
fileext = ".vcf"

[storage google_calendar]
type = "google_calendar"
token_file = "~/.vdirsyncer/gcal.auth"
client_id  = "<client ID>"
client_secret = "<client secret>"

[storage google_contacts]
type = "google_contacts"
token_file = "~/.vdirsyncer/gcard.auth"
client_id  = "<client ID>"
client_secret = "<client secret>"

[pair calendar]
a = "local_calendar"
b = "google_calendar"
collections = ["from a", "from b"]
conflict_resolution = "b wins"
metadata = ["color", "displayname"]

[pair contacts]
a = "local_contacts"
b = "google_contacts"
collections = ["from a", "from b"]
conflict_resolution = "b wins"
metadata = ["displayname"]
{% endhighlight %}

Save with *CTRL+o* *Enter* and close with *CTRL+x*. Run `vdirsyncer discover`. On the first run you'll once again get a long URL you should copy and open in your browser. You'll get a scary warning about an unverified app, just click Advanced and proceed. Once you grant permission for your calendar, copy the code and paste it into the terminal. Then you'll be prompted for each calendar in your Google account since it doesn't exist locally. Just enter "y" to create it every time.

Once the calendars are configured you'll get a long authorization URL for your contacts. The steps to take are exactly the same as for the calendar.

Now that vdirsyncer is authorized and aware of all our calendars and address books, we're ready to sync. Run `vdirsyncer sync` and then `vdirsyncer metasync`. Now, to automate this, let's create a cron job. Run `crontab -e`, scroll to the last line, and put this in it:

```crontab
40 */1 * * * vdirsyncer sync >> /home/ozymandias/vdirsyncer.log 2>&1
50 */1 * * * vdirsyncer metasync >> /home/ozymandias/vdirsyncer.log 2>&1
```

## Closing Words

Data security is very important, as losing your data in this digital age can be devastating. By following this tutorial you took a major step in ensuring your data survives no matter what.

Ideally, you'd have a similar setup somewhere away from home for off-site backups. So that in the event of a disaster such as flooding, fire, or similar event that could physically destroy your backup server and devices, you'd still have a copy of your data that wasn't affected by this event. You should consider this going forward.

I tried to make this tutorial as exhaustive as I could, even so, since I don't own any Apple devices, I couldn't cover those. I may have unintentionally made omissions elsewhere as well.
If you see an error or have something to add, all of my articles are hosted on [GitHub](https://github.com/OzymandiasTheGreat/articles) under Creative Commons Attribution Share-Alike license version 4.0. So feel free to make edits and pull requests, you will get attribution at the end of the article.

Congratulations on securing your data, stay safe out there!
