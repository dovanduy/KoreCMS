﻿using System.Web.Mvc;

namespace Kore.Web.Areas.Admin.Indexing
{
    public class IndexingAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get { return KoreWebConstants.Areas.Indexing; }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
        }
    }
}