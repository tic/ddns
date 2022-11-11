# ddns
This is a small script made for keeping a DNS record on a Namecheap-managed domain up to date with the current WAN IP -- i.e. dynamic dns.

## Setup Instructions
1. Enable DDNS for your domain on Namecheap.

    * Navigate to the [Namecheap Dashboard](https://ap.www.namecheap.com/dashboard) (a.k.a. *My Account Panel*).
    * Click Manage on the domain for which you wish to have ddns.
![](https://i.gyazo.com/4b9aa2c6ed2a5e27bcb7ffe1d9ce4a24.png)
    * Verify that Namecheap DNS is selected in the Nameservers dropdown. In order for this DDNS strategy to work, you will need to be using some form of Namecheap DNS service (free, premium, etc.). Once you've verified that you're using Namecheap's DNS services, click [Advanced DNS](https://ap.www.namecheap.com/domains/domaincontrolpanel/INSERT_YOUR_DOMAIN/advancedns).
![](https://i.gyazo.com/91fbed9c85118b2a995c72485df39d08.png)
    * Add a new **A record** (**AAAA records are not supported** -- as of writing, this script only works with IPv4, per a limitation with the Namecheap API endpoint). For the host, enter whatever subdomain you wish to be set to your WAN ip. If you want the domain itself to point at your WAN ip, use '@' as the host. In the image below, The host has been set to "ddns" as an example. Leave TTL as automatic, or set it to 30 minutes. Set it to any address you want. It will be updated to your WAN IP as soon as we run the script, so you can just use "1.1.1.1" for now.
![](https://i.gyazo.com/1fbe64108b3eff588583a43f4fc05076.png)
    * Scroll down to the Dynamic DNS section and enable it. Copy the password that is generated, we will use it in next.
![](https://i.gyazo.com/8de4c655016c0c4243da9c36462d4519.png)



2. Create environment file and set variables

    * Create the environment file: `cat .env.template > .env`.
    * Set the environment variables by opening the environment file in your favorite text editor: `nano .env`
        * I recommend setting the polling frequency to 300000 (5 minutes).

3. Install dependencies

    * Run `npm i`.
    * Start the script with `npm run start`.

4. Done!
