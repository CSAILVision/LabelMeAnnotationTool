# UBUNTU 16.04 CONFIGURATION

1. Update and upgrade the Ubuntu distribution.

    ``` sh
    sudo apt-get update -y

    sudo DEBIAN_FRONTEND=noninteractive apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade
    ```

1. Install a dependencies for LabelMe. This includes "Apache", "Perl", and git.

    ``` sh
    sudo apt-get install -y \
     apache2 \
     git \
     libapache2-mod-perl2 \
     libcgi-session-perl \
     libapache2-mod-php \
     make \
     php
    ```
    
1. Configure Apache.

    ``` sh
    sudo a2enmod include

    sudo a2enmod rewrite

    sudo a2enmod cgi
    ```

1. Edit `/etc/apache2/sites-available/000-default.conf` so that the following is
   the only <Directory> element in the file.

    ``` sh
    sudo tee /etc/apache2/sites-available/000-default.conf <<EOL
    <Directory "/var/www/html/LabelMeAnnotationTool">
       Options Indexes FollowSymLinks MultiViews Includes ExecCGI
       AddHandler cgi-script .cgi
       AllowOverride All
       Require all granted
       AddType text/html .shtml
       AddOutputFilter INCLUDES .shtml
       DirectoryIndex index.shtml
    </Directory>
    EOL
    ```
    
1. Clone LabelMe from GitHub. Move the LabelMe files to Apache/web-server directories.

    ``` sh
    git clone https://github.com/CSAILVision/LabelMeAnnotationTool.git

    sudo mv ./LabelMeAnnotationTool/ /var/www/html/LabelMeAnnotationTool/
    ```

1. Run the *Makefile*.

    ```
    cd /var/www/html/LabelMeAnnotationTool/

    make
    ```

1. Update the permissions of the LabelMe files.

    ```
    sudo chown -R www-data:www-data /var/www/html
    ```

1. Restart Apache.

    ```
    sudo service apache2 restart
    ```

*Note, there is a [YouTube tutorial](https://www.youtube.com/watch?v=07uHcjRjAbM) by thelittlekid that demos LabelMe installation on a local Ubuntu 16.04 box.*
