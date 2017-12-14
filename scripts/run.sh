# A script that sets up the environment and runs the web server.
#
# The script has several flags that can be used to control program behavior, as
# well as convenience flags to automatically invoke the setup and build scripts.
#
# By default, the script will run setup.sh and build.sh and run the web server
# so that an in-memory database with sample data is used and port 8080 is used
# to listen for requests.

#!/bin/bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${DIR}/shflags"

DEFINE_string "envroot" "$DIR/../env" "The environment root." "e"
DEFINE_boolean "debug" ${FLAGS_TRUE} "Whether to run the server in debug mode." "d"
DEFINE_boolean "setup" ${FLAGS_TRUE} "Whether to run the setup script." "s"
DEFINE_boolean "build" ${FLAGS_TRUE} "Whether to run the build script." "b"
DEFINE_integer "port" 8080 "The port on which to listen for requests." "p"
DEFINE_string "db_type" "sqlite" "The type of database to use." "t"
DEFINE_string "db_user" "uwsolar" "The database user." "u"
DEFINE_string "db_password" "" "The database password." "q"
DEFINE_string "db_host" ":memory:" "The database host." "o"
DEFINE_string "db_name" "uwsolar" "The database name." "n"
DEFINE_integer "db_pool_size" 3 "The database connection pool size." "r"

FLAGS "$@" || exit $?
eval set -- "${FLAGS_ARGV}"

set -e

if [ ${FLAGS_debug} -eq ${FLAGS_TRUE} ]; then
  BUILD_DEBUG_FLAG="--debug"
  SERVER_DEBUG_FLAG="--debug"
else
  BUILD_DEBUG_FLAG="--nodebug"
  SERVER_DEBUG_FLAG=""
fi

# Install build and runtime dependencies.
if [ ${FLAGS_setup} -eq ${FLAGS_TRUE} ]; then
  $DIR/setup.sh
fi

# Ensure that Python dependencies have been installed.
if [ ! -d "${FLAGS_envroot}" ]; then
  echo -e "\e[91mNo environment directory found. Run setup.sh.\e[0m"
  exit -1
fi

# Build stylesheets and JavaScript sources.
if [ ${FLAGS_build} -eq ${FLAGS_TRUE} ]; then
  $DIR/build.sh $BUILD_DEBUG_FLAG
fi

# Ensure that stylesheets have been built.
if [ ! -f "$DIR/../www/css/dist/uwsolar.css" ]; then
  echo -e "\e[91mStylesheets not found. Run build.sh.\e[0m"
  exit -1
fi

# Ensure that JavaScript sources have been built.
if [ ! -f "$DIR/../www/js/dist/uwsolar.js" ]; then
  echo -e "\e[91mJavaScript archives not found. Run build.sh.\e[0m"
  exit -1
fi

# Run the web server.
echo -e "\e[1;45mRunning web server...\e[0m"
python3 -m venv "${FLAGS_envroot}"
source ${FLAGS_envroot}/bin/activate
python src/main.py \
  $SERVER_DEBUG_FLAG \
  --port=${FLAGS_port} \
  --db_type=${FLAGS_db_type} \
  --db_user=${FLAGS_db_user} \
  --db_password=${FLAGS_db_password} \
  --db_host=${FLAGS_db_host} \
  --db_name=${FLAGS_db_name} \
  --db_pool_size=${FLAGS_db_pool_size}
deactivate
