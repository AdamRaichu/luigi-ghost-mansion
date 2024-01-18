# Requires microsoft devtunnel to be installed.
# See https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/get-started#install

devtunnel host -p 1338 --allow-anonymous &
devtunnel host -p 8080 --allow-anonymous