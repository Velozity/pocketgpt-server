#!/usr/bin/env bash

# Loading environment data
EB_APP_CURRENT_DIR=$(/opt/elasticbeanstalk/bin/get-config platformconfig -k AppDeployDir)

# Run main script
su -c "cd $EB_APP_CURRENT_DIR; npx prisma generate"