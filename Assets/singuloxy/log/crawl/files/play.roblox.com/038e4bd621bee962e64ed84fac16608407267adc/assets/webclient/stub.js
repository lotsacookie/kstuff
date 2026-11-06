/* eslint-disable */
"use strict";
(() => {
  // server-endpoints.ts
  var apiBaseUrls = {
    prod: {
      clientSettingsHost: "clientsettings.roblox.com",
      settingsFlagsHost: "clientsettingscdn.roblox.com",
      setupCdnBase: "https://setup.rbxcdn.com",
      websiteHost: "www.roblox.com"
    },
    st1: {
      clientSettingsHost: "clientsettings.sitetest1.robloxlabs.com",
      settingsFlagsHost: "clientsettingscdn.sitetest1.robloxlabs.com",
      setupCdnBase: "https://s3.amazonaws.com/setup.sitetest1.robloxlabs.com",
      websiteHost: "www.sitetest1.robloxlabs.com"
    },
    st2: {
      clientSettingsHost: "clientsettings.sitetest2.robloxlabs.com",
      settingsFlagsHost: "clientsettingscdn.sitetest2.robloxlabs.com",
      setupCdnBase: "https://s3.amazonaws.com/setup.sitetest2.robloxlabs.com",
      websiteHost: "www.sitetest2.robloxlabs.com"
    },
    st3: {
      clientSettingsHost: "clientsettings.sitetest3.robloxlabs.com",
      settingsFlagsHost: "clientsettingscdn.sitetest3.robloxlabs.com",
      setupCdnBase: "https://s3.amazonaws.com/setup.sitetest3.robloxlabs.com",
      websiteHost: "www.sitetest3.robloxlabs.com"
    }
  };

  // stub.ts
  var ALLOWED_ENGINE_PREFIXES = Object.values(apiBaseUrls).map((endpoint) => `${endpoint.setupCdnBase}/webclient/`);
  var src = new URLSearchParams(self.location.search).get("src");
  if (!src)
    throw new Error("[stub] missing src parameter");
  var engineScriptUrl = new URL(src).href;
  if (!ALLOWED_ENGINE_PREFIXES.some((prefix) => engineScriptUrl.startsWith(prefix)))
    throw new Error(`[stub] refusing to load engine script from ${engineScriptUrl}`);
  importScripts(engineScriptUrl);
})();
