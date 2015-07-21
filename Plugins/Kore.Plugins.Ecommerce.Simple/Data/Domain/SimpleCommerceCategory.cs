﻿using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using Kore.Data;
using Kore.Data.EntityFramework;
using Kore.Web.Plugins;

namespace Kore.Plugins.Ecommerce.Simple.Data.Domain
{
    public class SimpleCommerceCategory : IEntity
    {
        private ICollection<SimpleCommerceProduct> products;
        private ICollection<SimpleCommerceCategory> subCategories;

        public int Id { get; set; }

        public int? ParentId { get; set; }

        public string Name { get; set; }

        public string Slug { get; set; }

        public int Order { get; set; }

        public string ImageUrl { get; set; }

        public string Description { get; set; }

        public string MetaKeywords { get; set; }

        public string MetaDescription { get; set; }

        public virtual SimpleCommerceCategory Parent { get; set; }

        public virtual ICollection<SimpleCommerceProduct> Products
        {
            get { return products ?? (products = new List<SimpleCommerceProduct>()); }
            set { products = value; }
        }

        public virtual ICollection<SimpleCommerceCategory> SubCategories
        {
            get { return subCategories ?? (subCategories = new List<SimpleCommerceCategory>()); }
            set { subCategories = value; }
        }

        #region IEntity Members

        public object[] KeyValues
        {
            get { return new object[] { Id }; }
        }

        #endregion IEntity Members
    }

    public class CategoryMap : EntityTypeConfiguration<SimpleCommerceCategory>, IEntityTypeConfiguration
    {
        public CategoryMap()
        {
            ToTable(Constants.Tables.Categories);
            HasKey(x => x.Id);
            Property(x => x.Name).HasMaxLength(255).IsRequired();
            Property(x => x.Slug).HasMaxLength(255).IsRequired();
            Property(x => x.Order).IsRequired();
            Property(x => x.ImageUrl).HasMaxLength(255);
            Property(x => x.Description).HasMaxLength(255);
            Property(x => x.MetaKeywords).HasMaxLength(255);
            Property(x => x.MetaDescription).HasMaxLength(255);
            HasOptional(x => x.Parent).WithMany(x => x.SubCategories).HasForeignKey(x => x.ParentId);
        }

        #region IEntityTypeConfiguration Members

        public bool IsEnabled
        {
            get { return PluginManager.IsPluginInstalled(Constants.PluginSystemName); }
        }

        #endregion IEntityTypeConfiguration Members
    }
}