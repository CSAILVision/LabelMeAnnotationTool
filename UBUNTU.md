### UBUNTU CONFIGURATION

*Note: Instructions specific to [Ubuntu 16.04](UBUNTU_16_04.md) are found at this [link](UBUNTU_16_04.md).*

1. Install "Apache" and "Perl" and configure.

   ``` sh
   apt-get install apache2
   apt-get install libapache2-mod-perl2
   a2enmod include
   a2enmod rewrite
   a2enmod cgi
   ```

2. Edit /etc/apache2/sites-available/default so that the following is
   the only <Directory> element in the file (change
   REPLACE_WITH_YOUR_LOCATION with the directory location of the LabelMe
   annotation tool code, e.g. /var/www/LabelMeAnnotationTool):

   ``` sh
   <Directory "REPLACE_WITH_YOUR_LOCATION">
       Options Indexes FollowSymLinks MultiViews +Includes
       AllowOverride all
       Order allow,deny
       allow from all
       AddType text/html .shtml
       AddOutputFilter INCLUDES .shtml
       DirectoryIndex index.shtml
   </Directory>
   ```

   For Ubuntu 14.04 with Apache 2.4 (edit file /etc/apache2/sites-available/000-default.conf):

   ``` sh
   <Directory "REPLACE_WITH_YOUR_LOCATION">
       Options Indexes FollowSymLinks MultiViews Includes ExecCGI
       AddHandler cgi-script .cgi
       AllowOverride all
       Require all granted
       AddType text/html .shtml
       AddOutputFilter INCLUDES .shtml
       DirectoryIndex index.shtml
   </Directory>
   ```
