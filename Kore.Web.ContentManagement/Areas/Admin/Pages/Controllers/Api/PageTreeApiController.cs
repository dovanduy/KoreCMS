﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.OData;
using System.Web.OData.Query;
using Kore.Collections;
using Kore.Infrastructure;
using Kore.Web.ContentManagement.Areas.Admin.Pages.Domain;
using Kore.Web.ContentManagement.Areas.Admin.Pages.Services;
using Kore.Web.Security.Membership.Permissions;

namespace Kore.Web.ContentManagement.Areas.Admin.Pages.Controllers.Api
{
    public class PageTreeApiController : ODataController
    {
        private readonly IPageService service;
        private readonly IWorkContext workContext;

        public PageTreeApiController(IPageService service, IWorkContext workContext)
        {
            this.service = service;
            this.workContext = workContext;
        }

        //[EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All, MaxExpansionDepth = 10)]
        public async Task<IEnumerable<PageTreeItem>> Get(ODataQueryOptions<PageTreeItem> options)
        {
            if (!CheckPermission(CmsPermissions.PagesRead))
            {
                return Enumerable.Empty<PageTreeItem>();
            }

            int tenantId = GetTenantId();
            var pages = await service.FindAsync(x => x.TenantId == tenantId);

            var hierarchy = pages
                .Where(x => x.ParentId == null)
                .OrderBy(x => x.Order)
                .ThenBy(x => x.Name)
                .Select(x => new PageTreeItem
                {
                    Id = x.Id,
                    Title = x.Name,
                    IsEnabled = x.IsEnabled,
                    SubPages = GetSubPages(pages, x.Id).ToList()
                });

            var settings = new ODataValidationSettings()
            {
                AllowedQueryOptions = AllowedQueryOptions.All,
                MaxExpansionDepth = 10
            };
            options.Validate(settings);

            var results = options.ApplyTo(hierarchy.AsQueryable());
            return (results as IQueryable<PageTreeItem>).ToHashSet();
        }

        //[EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All, MaxExpansionDepth = 10)]
        public virtual async Task<SingleResult<PageTreeItem>> Get([FromODataUri] Guid key)
        {
            if (!CheckPermission(CmsPermissions.PagesRead))
            {
                return SingleResult.Create(Enumerable.Empty<PageTreeItem>().AsQueryable());
            }

            int tenantId = GetTenantId();
            var pages = await service.FindAsync(x => x.TenantId == tenantId);
            var entity = pages.FirstOrDefault(x => x.Id == key);

            return SingleResult.Create(new[] { entity }.Select(x => new PageTreeItem
            {
                Id = x.Id,
                Title = x.Name,
                IsEnabled = x.IsEnabled,
                SubPages = GetSubPages(pages, x.Id).ToList()
            }).AsQueryable());
        }

        private static IEnumerable<PageTreeItem> GetSubPages(IEnumerable<Page> pages, Guid parentId)
        {
            return pages
                .Where(x => x.ParentId == parentId)
                .OrderBy(x => x.Order)
                .ThenBy(x => x.Name)
                .Select(x => new PageTreeItem
                {
                    Id = x.Id,
                    Title = x.Name,
                    IsEnabled = x.IsEnabled,
                    SubPages = GetSubPages(pages, x.Id).ToList()
                });
        }

        protected virtual bool CheckPermission(Permission permission)
        {
            var authorizationService = EngineContext.Current.Resolve<IAuthorizationService>();
            return authorizationService.TryCheckAccess(permission, workContext.CurrentUser);
        }

        protected virtual int GetTenantId()
        {
            return workContext.CurrentTenant.Id;
        }
    }

    public class PageTreeItem
    {
        public PageTreeItem()
        {
            SubPages = new List<PageTreeItem>();
        }

        public Guid Id { get; set; }

        public string Title { get; set; }

        public bool IsEnabled { get; set; }

        public List<PageTreeItem> SubPages { get; set; }
    }
}