﻿using Kore.Infrastructure;
using Kore.Web.Configuration;
namespace Kore.Web
{
    public static class KoreWebConstants
    {
        private static string defaultAdminLayoutPath;
        private static string defaultFrontendLayoutPath;

        public static string DefaultAdminLayoutPath
        {
            get
            {
                if (string.IsNullOrEmpty(defaultAdminLayoutPath))
                {
                    var siteSettings = EngineContext.Current.Resolve<KoreSiteSettings>();

                    defaultAdminLayoutPath = string.IsNullOrEmpty(siteSettings.AdminLayoutPath)
                        ? "~/Areas/Admin/Views/Shared/_Layout.cshtml"
                        : siteSettings.AdminLayoutPath;
                }
                return defaultAdminLayoutPath;
            }
        }

        public static string DefaultFrontendLayoutPath
        {
            get
            {
                if (string.IsNullOrEmpty(defaultFrontendLayoutPath))
                {
                    var siteSettings = EngineContext.Current.Resolve<KoreSiteSettings>();

                    defaultFrontendLayoutPath = string.IsNullOrEmpty(siteSettings.AdminLayoutPath)
                        ? "~/Views/Shared/_Layout.cshtml"
                        : siteSettings.DefaultFrontendLayoutPath;
                }
                return defaultFrontendLayoutPath;
            }
        }

        public static class Areas
        {
            public const string Configuration = "Admin/Configuration";
            public const string Indexing = "Admin/Indexing";
            public const string Plugins = "Admin/Plugins";
            public const string ScheduledTasks = "Admin/ScheduledTasks";
        }

        public static class CacheKeys
        {
        }

        public static class Indexing
        {
            public const string DefaultIndexName = "Search";
        }

        //public static class Features
        //{
        //    public const string Media = "Kore.ContentManagement.Media";
        //}

        public static class StateProviders
        {
            public const string CurrentCultureCode = "CurrentCultureCode";
            public const string CurrentDesktopTheme = "CurrentDesktopTheme";
            public const string CurrentMobileTheme = "CurrentMobileTheme";
            public const string CurrentUser = "CurrentUser";
        }
    }
}