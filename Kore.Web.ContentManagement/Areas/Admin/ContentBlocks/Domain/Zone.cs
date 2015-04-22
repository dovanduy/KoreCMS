﻿using System;
using System.Data.Entity.ModelConfiguration;
using Kore.Data;
using Kore.Data.EntityFramework;

namespace Kore.Web.ContentManagement.Areas.Admin.ContentBlocks.Domain
{
    public class Zone : IEntity
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        #region IEntity Members

        public object[] KeyValues
        {
            get { return new object[] { Id }; }
        }

        #endregion IEntity Members
    }

    public class ZoneMap : EntityTypeConfiguration<Zone>, IEntityTypeConfiguration
    {
        public ZoneMap()
        {
            ToTable("Kore_Zones");
            HasKey(x => x.Id);
            Property(x => x.Name).HasMaxLength(255).IsRequired();
        }
    }
}