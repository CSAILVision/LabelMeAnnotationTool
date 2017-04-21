# base image
FROM ubuntu:14.04.5

# install dependencies
RUN apt-get -y update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    apache2 \
    php5 \
    libapache2-mod-perl2 \
    libapache2-mod-php5

# clean up
RUN apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm /var/log/dpkg.log

# apache2 configuration
RUN a2enmod include
RUN a2enmod rewrite
RUN a2enmod cgi
RUN update-rc.d apache2 defaults

# confd apache2 configuration
RUN rm /etc/apache2/sites-enabled/000-default.conf
ADD ubuntu.conf /etc/apache2/sites-enabled/000-default.conf

# configure environment
ENV LANG=C
ENV APACHE_LOCK_DIR                     /var/lock/apache2
ENV APACHE_RUN_DIR                      /var/run/apache2
ENV APACHE_PID_FILE                     ${APACHE_RUN_DIR}/apache2.pid
ENV APACHE_LOG_DIR                      /var/log/apache2
ENV APACHE_RUN_USER                     www-data
ENV APACHE_RUN_GROUP                    www-data
ENV APACHE_MAX_REQUEST_WORKERS          32
ENV APACHE_MAX_CONNECTIONS_PER_CHILD    1024
ENV APACHE_ALLOW_OVERRIDE               None
ENV APACHE_ALLOW_ENCODED_SLASHES        Off

# deploy repo
RUN cd /var/www/ \
    && rm -rf html \
    && git clone https://github.com/CSAILVision/LabelMeAnnotationTool.git html \
    && cd html \
    && make \
    && chown -R ${APACHE_RUN_USER}:${APACHE_RUN_GROUP} /var/www

# port binding
EXPOSE 80

# run
CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
