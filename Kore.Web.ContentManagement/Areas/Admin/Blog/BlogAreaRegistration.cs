﻿using System.Web.Mvc;
using Kore.Infrastructure;
using Kore.Web.Configuration;
using Kore.Web.Mvc.RoboUI;

namespace Kore.Web.ContentManagement.Areas.Admin.Blog
{
    public class BlogAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get { return Constants.Areas.Blog; }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            RoboSettings.RegisterAreaLayoutPath(Constants.Areas.Blog, KoreWebConstants.DefaultAdminLayoutPath);
        }
    }
}