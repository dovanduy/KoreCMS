﻿using System.Linq;
using Kore.Caching;
using Kore.Data;
using Kore.Data.Services;
using Kore.Web.ContentManagement.Areas.Admin.Menus.Domain;

namespace Kore.Web.ContentManagement.Areas.Admin.Menus.Services
{
    public interface IMenuService : IGenericDataService<Menu>
    {
        Menu FindByName(string name, string urlFilter = null);
    }

    public class MenuService : GenericDataService<Menu>, IMenuService
    {
        public MenuService(ICacheManager cacheManager, IRepository<Menu> repository)
            : base(cacheManager, repository)
        {
        }

        #region IMenuService Members

        public Menu FindByName(string name, string urlFilter = null)
        {
            if (string.IsNullOrEmpty(urlFilter))
            {
                return FindOne(x => x.Name == name && (x.UrlFilter == null || x.UrlFilter == ""));
            }

            return FindOne(x => x.Name == name && (x.UrlFilter.Contains(urlFilter)));
        }

        #endregion IMenuService Members
    }
}