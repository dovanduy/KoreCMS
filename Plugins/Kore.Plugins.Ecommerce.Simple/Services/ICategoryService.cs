﻿using Kore.Caching;
using Kore.Data;
using Kore.Data.Services;
using Kore.Plugins.Ecommerce.Simple.Data.Domain;

namespace Kore.Plugins.Ecommerce.Simple.Services
{
    public interface ICategoryService : IGenericDataService<Category>
    {
    }

    public class CategoryService : GenericDataService<Category>, ICategoryService
    {
        public CategoryService(ICacheManager cacheManager, IRepository<Category> repository)
            : base(cacheManager, repository)
        {
        }
    }
}