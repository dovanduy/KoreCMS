﻿using Autofac;
using Kore.Infrastructure;
using Kore.Localization;
using Kore.Plugins.Widgets.Google.ContentBlocks;
using Kore.Web.ContentManagement.Areas.Admin.ContentBlocks;
using Kore.Web.Mvc.Themes;
using Kore.Web.Plugins;

namespace Kore.Plugins.Widgets.Google.Infrastructure
{
    public class DependencyRegistrar : IDependencyRegistrar<ContainerBuilder>
    {
        #region IDependencyRegistrar<ContainerBuilder> Members

        public void Register(ContainerBuilder builder, ITypeFinder typeFinder)
        {
            if (!PluginManager.IsPluginInstalled(Constants.PluginSystemName))
            {
                return;
            }

            builder.RegisterType<LanguagePackInvariant>().As<ILanguagePack>().SingleInstance();
            builder.RegisterType<GoogleAnalyticsBlock>().As<IContentBlock>().InstancePerDependency();
            builder.RegisterType<GoogleAdSenseBlock>().As<IContentBlock>().InstancePerDependency();
            builder.RegisterType<GoogleMapBlock>().As<IContentBlock>().InstancePerDependency();

            builder.RegisterType<LocationFormatProvider>().As<ILocationFormatProvider>().SingleInstance();
        }

        public int Order => 9999;

        #endregion IDependencyRegistrar<ContainerBuilder> Members
    }
}