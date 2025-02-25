#!/bin/bash

if [ -z "$USERNAME" ]; then
    printf "USERNAME wasn't set as an environment variable. ${GREEN}Please enter your amazon username:${RESET} "
    read USERNAME
fi

if [ -z "$PASSWORD" ]; then
    printf "PASSWORD wasn't set as an environment variable.  ${GREEN}Please enter your amazon password:${RESET} "
    read -s PASSWORD
    printf "\n"
fi

if [ -z "$OTP" ]; then
    printf "OTP wasn't set as an environment variable. ${GREEN}If you have 2FA enabled please enter the token now. Otherwise leave blank:${RESET} "
    read OTP
    printf "\n"
fi

RED="\e[31m"
GREEN="\e[32m"
RESET="\e[0m"
YELLOW="\e[33m"

envvars=()
envvars+=("-e AMAZON_USER='$USERNAME'")
envvars+=("-e PASSWORD='$PASSWORD'")

if [ ! -z $OTP ]; then
    envvars+=("-e OTP=$OTP")
fi

function run_command {
    cmd=$1
    printf "${GREEN}Running command:${RESET} $cmd"

    $($cmd)
    if [ $? -ne 0 ]; then
        printf "${RED}ERROR:${RESET} Command %s failed. Exiting..." $cmd
        exit 1
    fi
}

run_command "docker build . --platform linux/x86_64 -t amazon-kindle-bulk-downloader"
run_command "docker run --platform linux/x86_64 --rm -ti -v ./downloads:/app/downloads ${envvars[*]} amazon-kindle-bulk-downloader --baseUrl 'https://www.amazon.com'"

echo "All done!"
unset PASSWORD

exit 0