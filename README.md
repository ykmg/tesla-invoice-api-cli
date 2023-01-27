# Tesla Invoice CLI     

I got annoyed by downloading the invoices manually. Especially since the feature was added to the mobile app and removed from the website.

## Installation

Run:

```npm i @ykmg/tesla-invoice-api-cli -g```


## Usage

You need your VIN and an API-Token in order to run the script. You can export both variables as environment variables "TESLA_API_VIN" and "TESLA_API_TOKEN". Otherwise you will be asked upon script execution.

The script will create a Folder called "invoices" at the location from where it is called.

To tun the script just call

```
tesla-invoice-cli download
```
## Obtaining a Token

There are multiple apps available to securely generate access tokens yourself, for example:

- [Auth app for Tesla (iOS, macOS)](https://apps.apple.com/us/app/auth-app-for-tesla/id1552058613)
- [Tesla Tokens (Android)](https://play.google.com/store/apps/details?id=net.leveugle.teslatokens)
- [Tesla Auth (macOS, Linux, Windows)](https://github.com/adriankumpf/tesla_auth)


Tested on MacOS. Should also run seemlessly on Linux.
Windows is untested.


[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/R6R8I7IBK)

Have fun :)