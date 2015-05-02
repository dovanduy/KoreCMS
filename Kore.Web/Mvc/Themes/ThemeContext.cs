﻿using System;
using System.Linq;
using Kore.Infrastructure;
using Kore.Security.Membership;
using Kore.Web.Configuration;

namespace Kore.Web.Mvc.Themes
{
    /// <summary>
    /// Theme context
    /// </summary>
    public partial class ThemeContext : IThemeContext
    {
        private readonly IThemeProvider themeProvider;
        private readonly KoreSiteSettings siteSettings;

        private bool isDesktopThemeCached;
        private string cachedDesktopThemeName;

        private bool isMobileThemeCached;
        private string cachedMobileThemeName;

        public ThemeContext(IThemeProvider themeProvider, KoreSiteSettings siteSettings)
        {
            this.themeProvider = themeProvider;
            this.siteSettings = siteSettings;
        }

        /// <summary>
        /// Get or set current theme for desktops
        /// </summary>
        public string WorkingDesktopTheme
        {
            get
            {
                if (isDesktopThemeCached)
                {
                    return cachedDesktopThemeName;
                }

                string theme = string.Empty;

                if (siteSettings.AllowUserToSelectTheme)
                {
                    var workContext = EngineContext.Current.Resolve<IWorkContext>();
                    if (workContext.CurrentUser != null)
                    {
                        var membershipService = EngineContext.Current.Resolve<IMembershipService>();
                        string userTheme = membershipService.GetProfileEntry(workContext.CurrentUser.Id, ThemeUserProfileProvider.Fields.PreferredTheme);

                        if (!string.IsNullOrEmpty(userTheme))
                        {
                            theme = userTheme;
                        }
                    }
                }

                //TODO
                //if (KoreWebConfigurationSection.WebInstance.Themes.AllowUserToSelectTheme)
                //{
                //    //if (_workContext.CurrentCustomer != null)
                //    //    theme = _workContext.CurrentCustomer.GetAttribute<string>(SystemCustomerAttributeNames.WorkingDesktopThemeName, _genericAttributeService, _storeContext.CurrentStore.Id);
                //}

                //default store theme
                if (string.IsNullOrEmpty(theme))
                {
                    theme = siteSettings.DefaultDesktopTheme ?? "Default";
                }

                //ensure that theme exists
                if (!themeProvider.ThemeConfigurationExists(theme))
                {
                    var themeInstance = themeProvider.GetThemeConfigurations()
                        .FirstOrDefault(x => !x.MobileTheme);

                    if (themeInstance == null)
                    {
                        throw new Exception("No desktop theme could be loaded");
                    }

                    theme = themeInstance.ThemeName;
                }

                //cache theme
                this.cachedDesktopThemeName = theme;
                this.isDesktopThemeCached = true;
                return theme;
            }
            set
            {
                if (!siteSettings.AllowUserToSelectTheme)
                {
                    return;
                }

                //clear cache
                this.isDesktopThemeCached = false;
            }
        }

        /// <summary>
        /// Get current theme for mobile (e.g. Mobile)
        /// </summary>
        public string WorkingMobileTheme
        {
            get
            {
                if (isMobileThemeCached)
                    return cachedMobileThemeName;

                //default store theme
                string theme = siteSettings.DefaultMobileTheme;

                //ensure that theme exists
                if (!themeProvider.ThemeConfigurationExists(theme))
                {
                    var themeInstance = themeProvider.GetThemeConfigurations().FirstOrDefault(x => x.MobileTheme);

                    if (themeInstance == null)
                    {
                        throw new Exception("No mobile theme could be loaded");
                    }

                    theme = themeInstance.ThemeName;
                }

                //cache theme
                this.cachedMobileThemeName = theme;
                this.isMobileThemeCached = true;
                return theme;
            }
        }
    }
}