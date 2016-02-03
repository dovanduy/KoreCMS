﻿using System.Collections.Generic;
using Kore.Infrastructure;
using Kore.Web.Infrastructure;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(KoreCMS.Startup))]

namespace KoreCMS
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            if (!DataSettingsHelper.IsDatabaseInstalled)
            {
                return;
            }

            ConfigureAuth(app);

            var owinStartupConfigurations = EngineContext.Current.ResolveAll<IOwinStartupConfiguration>();

            var existingConfigurations = new List<string>();
            foreach (var owinStartupConfiguration in owinStartupConfigurations)
            {
                owinStartupConfiguration.Configuration(app, existingConfigurations);
            }
        }
    }
}