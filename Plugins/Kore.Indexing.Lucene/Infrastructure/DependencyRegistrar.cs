﻿using Autofac;
using Kore.Indexing.Lucene.Services;
using Kore.Infrastructure;
using Kore.Web.ContentManagement.Areas.Admin.Widgets;
using Kore.Web.Indexing;
using Kore.Web.Navigation;
using Kore.Web.Plugins;

namespace Kore.Indexing.Lucene.Infrastructure
{
    public class DependencyRegistrar : IDependencyRegistrar<ContainerBuilder>
    {
        #region IDependencyRegistrar<ContainerBuilder> Members

        public void Register(ContainerBuilder builder, ITypeFinder typeFinder)
        {
            if (!PluginManager.IsPluginInstalled("Kore.Indexing.Lucene"))
            {
                return;
            }

            builder.RegisterType<LuceneIndexProvider>().As<IIndexProvider>().InstancePerDependency();
            builder.RegisterType<LuceneSearchBuilder>().As<ISearchBuilder>().InstancePerDependency();
            builder.RegisterType<SearchWidget>().As<IWidget>().InstancePerDependency();
        }

        public int Order
        {
            get { return 9999; }
        }

        #endregion IDependencyRegistrar<ContainerBuilder> Members
    }
}