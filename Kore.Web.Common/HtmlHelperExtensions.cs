﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web.Mvc;
using System.Web.Mvc.Html;
using Kore.Infrastructure;
using Kore.Web.Collections;
using Kore.Web.Common.Areas.Admin.Regions.Services;
using Kore.Web.Common.Html;
using Kore.Web.Mvc;

namespace Kore.Web.Common
{
    public static class HtmlHelperExtensions
    {
        public static KoreCommon<TModel> KoreCommon<TModel>(this HtmlHelper<TModel> html) where TModel : class
        {
            return new KoreCommon<TModel>(html);
        }
    }

    public class KoreCommon<TModel>
        where TModel : class
    {
        private readonly HtmlHelper<TModel> html;

        internal KoreCommon(HtmlHelper<TModel> html)
        {
            this.html = html;
        }

        public Metro<TModel> Metro()
        {
            return new Metro<TModel>(html);
        }

        #region Regions

        #region Continents

        public MvcHtmlString ContinentDropDownList(string name, int? selectedValue = null, string emptyText = null, object htmlAttributes = null)
        {
            var selectList = GetContinents(selectedValue, emptyText);
            return html.DropDownList(name, selectList, htmlAttributes);
        }

        public MvcHtmlString ContinentDropDownListFor(Expression<Func<TModel, int>> expression, object htmlAttributes = null, string emptyText = null)
        {
            var func = expression.Compile();
            var selectedValue = func(html.ViewData.Model);

            var selectList = GetContinents(selectedValue, emptyText);
            return html.DropDownListFor(expression, selectList, htmlAttributes);
        }

        public MvcHtmlString ContinentCheckBoxList(
            string name,
            IEnumerable<string> selectedIds,
            object labelHtmlAttributes = null,
            object checkboxHtmlAttributes = null)
        {
            var selectList = GetContinents();

            return html.CheckBoxList(
                name,
                selectList,
                selectedIds,
                labelHtmlAttributes: labelHtmlAttributes,
                checkboxHtmlAttributes: checkboxHtmlAttributes);
        }

        public MvcHtmlString ContinentCheckBoxListFor(
            Expression<Func<TModel, IEnumerable<string>>> expression,
            object labelHtmlAttributes = null,
            object checkboxHtmlAttributes = null)
        {
            var selectList = GetContinents();

            return html.CheckBoxListFor(
                expression,
                selectList,
                labelHtmlAttributes: labelHtmlAttributes,
                checkboxHtmlAttributes: checkboxHtmlAttributes);
        }

        #endregion Continents

        #region Countries

        public MvcHtmlString CountryDropDownList(string name, int? selectedValue = null, string emptyText = null, object htmlAttributes = null)
        {
            var selectList = GetCountries(selectedValue, emptyText);
            return html.DropDownList(name, selectList, htmlAttributes);
        }

        public MvcHtmlString CountryDropDownListFor(Expression<Func<TModel, int>> expression, object htmlAttributes = null, string emptyText = null)
        {
            var func = expression.Compile();
            var selectedValue = func(html.ViewData.Model);

            var selectList = GetCountries(selectedValue, emptyText);
            return html.DropDownListFor(expression, selectList, htmlAttributes);
        }

        public MvcHtmlString CountryCheckBoxList(
            string name,
            IEnumerable<string> selectedIds,
            object labelHtmlAttributes = null,
            object checkboxHtmlAttributes = null)
        {
            var selectList = GetCountries();

            return html.CheckBoxList(
                name,
                selectList,
                selectedIds,
                labelHtmlAttributes: labelHtmlAttributes,
                checkboxHtmlAttributes: checkboxHtmlAttributes);
        }

        public MvcHtmlString CountryCheckBoxListFor(
            Expression<Func<TModel, IEnumerable<string>>> expression,
            object labelHtmlAttributes = null,
            object checkboxHtmlAttributes = null)
        {
            var selectList = GetCountries();

            return html.CheckBoxListFor(
                expression,
                selectList,
                labelHtmlAttributes: labelHtmlAttributes,
                checkboxHtmlAttributes: checkboxHtmlAttributes);
        }

        #endregion Countries

        private static IEnumerable<SelectListItem> GetContinents(int? selectedValue = null, string emptyText = null)
        {
            var service = EngineContext.Current.Resolve<IRegionService>();
            var workContext = EngineContext.Current.Resolve<IWorkContext>();

            var records = service.GetContinents(workContext.CurrentTenant.Id, workContext.CurrentCultureCode)
                .OrderBy(x => x.Order == null)
                .ThenBy(x => x.Order)
                .ThenBy(x => x.Name);

            return records.ToSelectList(
                value => value.Id,
                text => text.Name,
                selectedValue,
                emptyText);
        }

        private static IEnumerable<SelectListItem> GetCountries(int? selectedValue = null, string emptyText = null)
        {
            var service = EngineContext.Current.Resolve<IRegionService>();
            var workContext = EngineContext.Current.Resolve<IWorkContext>();

            var records = service.GetCountries(workContext.CurrentTenant.Id, workContext.CurrentCultureCode)
                .OrderBy(x => x.Order == null)
                .ThenBy(x => x.Order)
                .ThenBy(x => x.Name);

            return records.ToSelectList(
                value => value.Id,
                text => text.Name,
                selectedValue,
                emptyText);
        }

        #endregion Regions
    }
}