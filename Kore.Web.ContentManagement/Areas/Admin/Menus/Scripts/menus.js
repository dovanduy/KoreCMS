﻿define(function (require) {
    'use strict'

    var $ = require('jquery');
    var ko = require('knockout');

    require('jqueryval');
    require('kendo');
    require('notify');

    require('kore-common');
    require('kore-section-switching');
    require('kore-jqueryval');

    var MenuItemModel = function (parent) {
        var self = this;

        self.parent = parent;
        self.id = ko.observable(emptyGuid);
        self.menuId = ko.observable(emptyGuid);
        self.text = ko.observable(null);
        self.description = ko.observable(null);
        self.url = ko.observable(null);
        self.cssClass = ko.observable(null);
        self.position = ko.observable(0);
        self.parentId = ko.observable(null);
        self.enabled = ko.observable(false);
        self.isExternalUrl = ko.observable(false);
        self.refId = ko.observable(null);

        self.validator = false;

        self.init = function () {
            self.validator = $("#item-edit-section-form").validate({
                rules: {
                    Item_Text: { required: true, maxlength: 255 },
                    Item_Description: { maxlength: 255 },
                    Item_Url: { required: true, maxlength: 255 },
                    Item_CssClass: { maxlength: 128 }
                }
            });

            $("#ItemsGrid").kendoGrid({
                data: null,
                dataSource: {
                    type: "odata",
                    transport: {
                        read: {
                            url: "/odata/kore/cms/MenuItemApi",
                            dataType: "json"
                        },
                        parameterMap: function (options, operation) {
                            var paramMap = kendo.data.transports.odata.parameterMap(options, operation);
                            if (paramMap.$inlinecount) {
                                if (paramMap.$inlinecount == "allpages") {
                                    paramMap.$count = true;
                                }
                                delete paramMap.$inlinecount;
                            }
                            if (paramMap.$filter) {
                                paramMap.$filter = paramMap.$filter.replace(/substringof\((.+),(.*?)\)/, "contains($2,$1)");

                                // Fix for GUIDs
                                var guid = /'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/ig;
                                paramMap.$filter = paramMap.$filter.replace(guid, "$1");
                            }
                            return paramMap;
                        }
                    },
                    schema: {
                        data: function (data) {
                            return data.value;
                        },
                        total: function (data) {
                            return data["@odata.count"];
                        },
                        model: {
                            id: "Id",
                            fields: {
                                Text: { type: "string" },
                                Url: { type: "string" },
                                Position: { type: "number" },
                                Enabled: { type: "boolean" }
                            }
                        }
                    },
                    pageSize: self.gridPageSize,
                    serverPaging: true,
                    serverFiltering: true,
                    serverSorting: true,
                    sort: { field: "Text", dir: "asc" },
                    filter: {
                        logic: "and",
                        filters: [
                          { field: "MenuId", operator: "eq", value: self.parent.menuModel.id() },
                          { field: "ParentId", operator: "eq", value: null }
                        ]
                    }
                },
                dataBound: function (e) {
                    var body = this.element.find("tbody")[0];
                    if (body) {
                        ko.cleanNode(body);
                        ko.applyBindings(ko.dataFor(body), body);
                    }
                },
                filterable: true,
                sortable: {
                    allowUnsort: false
                },
                pageable: {
                    refresh: true
                },
                scrollable: false,
                columns: [{
                    field: "Text",
                    title: self.parent.translations.Columns.MenuItem.Text,
                    filterable: true
                }, {
                    field: "Url",
                    title: self.parent.translations.Columns.MenuItem.Url,
                    filterable: true
                }, {
                    field: "Position",
                    title: self.parent.translations.Columns.MenuItem.Position,
                    filterable: true,
                    width: 70
                }, {
                    field: "Enabled",
                    title: self.parent.translations.Columns.MenuItem.Enabled,
                    template: '<i class="fa #=Enabled ? \'fa-check text-success\' : \'fa-times text-danger\'#"></i>',
                    attributes: { "class": "text-center" },
                    filterable: true,
                    width: 70
                }, {
                    field: "Id",
                    title: " ",
                    template:
                        '<div class="btn-group">' +
                        '<button type="button" data-bind="click: menuItemModel.edit.bind($data,\'#=Id#\')" class="btn btn-default btn-sm" title="' + self.parent.translations.Edit + '"><i class="fa fa-edit"></i></button>' +
                        '<button type="button" data-bind="click: menuItemModel.remove.bind($data,\'#=Id#\', null)" class="btn btn-danger btn-sm" title="' + self.parent.translations.Delete + '"><i class="fa fa-remove"></i></button>' +
                        '<button type="button" data-bind="click: menuItemModel.create.bind($data,\'#=MenuId#\', \'#=Id#\')" class="btn btn-primary btn-sm" title="' + self.parent.translations.NewItem + '"><i class="fa fa-plus"></i></button>' +
                        '<button type="button" data-bind="click: menuItemModel.toggleEnabled.bind($data,\'#=Id#\',\'#=ParentId#\', #=Enabled#)" class="btn btn-default btn-sm" title="' + self.parent.translations.Toggle + '"><i class="fa #=Enabled ? \'fa-toggle-on text-success\' : \'fa-toggle-off text-danger\'#"></i></button>' +
                        '</div>',
                    attributes: { "class": "text-center" },
                    filterable: false,
                    width: 200
                }],
                detailTemplate: kendo.template($("#items-template").html()),
                detailInit: self.parent.menuItemModel.detailInit
            });
        };
        self.create = function (menuId, parentId) {
            self.id(emptyGuid);
            self.menuId(menuId);
            self.text(null);
            self.description(null);
            self.url(null);
            self.cssClass(null);
            self.position(0);
            self.parentId(parentId);
            self.enabled(false);
            self.isExternalUrl(false);
            self.refId(null);

            self.validator.resetForm();
            switchSection($("#items-edit-section"));
        };
        self.edit = function (id) {
            $.ajax({
                url: "/odata/kore/cms/MenuItemApi(" + id + ")",
                type: "GET",
                dataType: "json",
                async: false
            })
            .done(function (json) {
                self.id(json.Id);
                self.menuId(json.MenuId);
                self.text(json.Text);
                self.description(json.Description);
                self.url(json.Url);
                self.cssClass(json.CssClass);
                self.position(json.Position);
                self.parentId(json.ParentId);
                self.enabled(json.Enabled);
                self.isExternalUrl(json.IsExternalUrl);
                self.refId(json.RefId);

                self.validator.resetForm();
                switchSection($("#items-edit-section"));
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(self.parent.translations.GetRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        };
        self.remove = function (id, parentId) {
            if (confirm(self.parent.translations.DeleteRecordConfirm)) {
                $.ajax({
                    url: "/odata/kore/cms/MenuItemApi(" + id + ")",
                    type: "DELETE",
                    dataType: "json",
                    async: false
                })
                .done(function (json) {
                    self.refreshGrid(parentId);
                    $.notify(self.parent.translations.DeleteRecordSuccess, "success");
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    $.notify(self.parent.translations.DeleteRecordError, "error");
                    console.log(textStatus + ': ' + errorThrown);
                });
            }
        };
        self.save = function () {
            if (!$("#item-edit-section-form").valid()) {
                return false;
            }

            var parentId = self.parentId();

            var record = {
                Id: self.id(),
                MenuId: self.menuId(),
                Text: self.text(),
                Description: self.description(),
                Url: self.url(),
                CssClass: self.cssClass(),
                Position: self.position(),
                ParentId: parentId,
                Enabled: self.enabled(),
                IsExternalUrl: self.isExternalUrl(),
                RefId: self.refId()
            };

            if (self.id() == emptyGuid) {
                // INSERT
                $.ajax({
                    url: "/odata/kore/cms/MenuItemApi",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(record),
                    dataType: "json",
                    async: false
                })
                .done(function (json) {
                    self.refreshGrid(parentId);
                    switchSection($("#items-grid-section"));
                    $.notify(self.parent.translations.InsertRecordSuccess, "success");
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    $.notify(self.parent.translations.InsertRecordError, "error");
                    console.log(textStatus + ': ' + errorThrown);
                });
            }
            else {
                // UPDATE
                $.ajax({
                    url: "/odata/kore/cms/MenuItemApi(" + self.id() + ")",
                    type: "PUT",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(record),
                    dataType: "json",
                    async: false
                })
                .done(function (json) {
                    self.refreshGrid(parentId);
                    switchSection($("#items-grid-section"));
                    $.notify(self.parent.translations.UpdateRecordSuccess, "success");
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    $.notify(self.parent.translations.UpdateRecordError, "error");
                    console.log(textStatus + ': ' + errorThrown);
                });
            }
        };
        self.goBack = function () {
            switchSection($("#grid-section"));
        };
        self.cancel = function () {
            switchSection($("#items-grid-section"));
        };
        self.toggleEnabled = function (id, parentId, isEnabled) {
            var patch = {
                Enabled: !isEnabled
            };

            $.ajax({
                url: "/odata/kore/cms/MenuItemApi(" + id + ")",
                type: "PATCH",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(patch),
                dataType: "json",
                async: false
            })
            .done(function (json) {
                self.refreshGrid(parentId);
                $.notify(self.parent.translations.UpdateRecordSuccess, "success");
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(self.parent.translations.UpdateRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        };

        self.refreshGrid = function(parentId) {
            if (parentId && (parentId != "null")) {
                try {
                    $('#items-grid-' + parentId).data('kendoGrid').dataSource.read();
                    $('#items-grid-' + parentId).data('kendoGrid').refresh();
                }
                catch (err) {
                    $('#ItemsGrid').data('kendoGrid').dataSource.read();
                    $('#ItemsGrid').data('kendoGrid').refresh();
                }
            }
            else {
                $('#ItemsGrid').data('kendoGrid').dataSource.read();
                $('#ItemsGrid').data('kendoGrid').refresh();
            }
        }
        self.detailInit = function(e) {
            var detailRow = e.detailRow;

            detailRow.find(".tabstrip").kendoTabStrip({
                animation: {
                    open: { effects: "fadeIn" }
                }
            });

            detailRow.find(".detail-grid").kendoGrid({
                data: null,
                dataSource: {
                    type: "odata",
                    transport: {
                        read: {
                            url: "/odata/kore/cms/MenuItemApi",
                            dataType: "json"
                        },
                        parameterMap: function (options, operation) {
                            var paramMap = kendo.data.transports.odata.parameterMap(options, operation);
                            if (paramMap.$inlinecount) {
                                if (paramMap.$inlinecount == "allpages") {
                                    paramMap.$count = true;
                                }
                                delete paramMap.$inlinecount;
                            }
                            if (paramMap.$filter) {
                                paramMap.$filter = paramMap.$filter.replace(/substringof\((.+),(.*?)\)/, "contains($2,$1)");

                                // Fix for GUIDs
                                var guid = /'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/ig;
                                paramMap.$filter = paramMap.$filter.replace(guid, "$1");
                            }
                            return paramMap;
                        }
                    },
                    schema: {
                        data: function (data) {
                            return data.value;
                        },
                        total: function (data) {
                            return data["@odata.count"];
                        },
                        model: {
                            id: "Id",
                            fields: {
                                Text: { type: "string" },
                                Url: { type: "string" },
                                Position: { type: "number" },
                                Enabled: { type: "boolean" }
                            }
                        }
                    },
                    pageSize: self.gridPageSize,
                    //serverPaging: true,
                    serverFiltering: true,
                    serverSorting: true,
                    sort: { field: "Text", dir: "asc" },
                    filter: { field: "ParentId", operator: "eq", value: e.data.Id }
                },
                dataBound: function (e) {
                    var body = this.element.find("tbody")[0];
                    if (body) {
                        ko.cleanNode(body);
                        ko.applyBindings(ko.dataFor(body), body);
                    }
                },
                pageable: false,
                //pageable: {
                //    refresh: true
                //},
                scrollable: false,
                columns: [{
                    field: "Text",
                    title: self.parent.translations.Columns.MenuItem.Text,
                    filterable: true
                }, {
                    field: "Url",
                    title: self.parent.translations.Columns.MenuItem.Url,
                    filterable: true
                }, {
                    field: "Position",
                    title: self.parent.translations.Columns.MenuItem.Position,
                    filterable: true,
                    width: 70
                }, {
                    field: "Enabled",
                    title: self.parent.translations.Columns.MenuItem.Enabled,
                    template: '<i class="fa #=Enabled ? \'fa-check text-success\' : \'fa-times text-danger\'#"></i>',
                    attributes: { "class": "text-center" },
                    filterable: true,
                    width: 70
                }, {
                    field: "Id",
                    title: " ",
                    template:
                        '<div class="btn-group">' +
                        '<button type="button" data-bind="click: menuItemModel.edit.bind($data,\'#=Id#\')" class="btn btn-default btn-sm" title="' + self.parent.translations.Edit + '"><i class="fa fa-edit"></i></button>' +
                        '<button type="button" data-bind="click: menuItemModel.remove.bind($data,\'#=Id#\',\'#=ParentId#\')" class="btn btn-danger btn-sm" title="' + self.parent.translations.Delete + '"><i class="fa fa-remove"></i></button>' +
                        '<button type="button" data-bind="click: menuItemModel.create.bind($data,\'#=MenuId#\', \'#=Id#\')" class="btn btn-primary btn-sm" title="' + self.parent.translations.NewItem + '"><i class="fa fa-plus"></i></button>' +
                        '<button type="button" data-bind="click: menuItemModel.toggleEnabled.bind($data,\'#=Id#\',\'#=ParentId#\', #=Enabled#)" class="btn btn-default btn-sm" title="' + self.parent.translations.Toggle + '"><i class="fa #=Enabled ? \'fa-toggle-on text-success\' : \'fa-toggle-off text-danger\'#"></i></button>' +
                        '</div>',
                    attributes: { "class": "text-center" },
                    filterable: false,
                    width: 200
                }],
                detailTemplate: kendo.template($("#items-template").html()),
                detailInit: self.parent.menuItemModel.detailInit
            });
        }
    };

    var MenuModel = function (parent) {
        var self = this;

        self.parent = parent;
        self.id = ko.observable(emptyGuid);
        self.name = ko.observable(null);
        self.urlFilter = ko.observable(null);

        self.validator = false;

        self.init = function () {
            self.validator = $("#form-section-form").validate({
                rules: {
                    Name: { required: true, maxlength: 255 }
                }
            });

            $("#Grid").kendoGrid({
                data: null,
                dataSource: {
                    type: "odata",
                    transport: {
                        read: {
                            url: "/odata/kore/cms/MenuApi",
                            dataType: "json"
                        },
                        parameterMap: function (options, operation) {
                            var paramMap = kendo.data.transports.odata.parameterMap(options, operation);
                            if (paramMap.$inlinecount) {
                                if (paramMap.$inlinecount == "allpages") {
                                    paramMap.$count = true;
                                }
                                delete paramMap.$inlinecount;
                            }
                            if (paramMap.$filter) {
                                paramMap.$filter = paramMap.$filter.replace(/substringof\((.+),(.*?)\)/, "contains($2,$1)");
                            }
                            return paramMap;
                        }
                    },
                    schema: {
                        data: function (data) {
                            return data.value;
                        },
                        total: function (data) {
                            return data["@odata.count"];
                        },
                        model: {
                            id: "Id",
                            fields: {
                                Name: { type: "string" },
                                UrlFilter: { type: "string" }
                            }
                        }
                    },
                    pageSize: self.gridPageSize,
                    serverPaging: true,
                    serverFiltering: true,
                    serverSorting: true,
                    sort: { field: "Name", dir: "asc" }
                },
                dataBound: function (e) {
                    var body = this.element.find("tbody")[0];
                    if (body) {
                        ko.cleanNode(body);
                        ko.applyBindings(ko.dataFor(body), body);
                    }
                },
                filterable: true,
                sortable: {
                    allowUnsort: false
                },
                pageable: {
                    refresh: true
                },
                scrollable: false,
                columns: [{
                    field: "Name",
                    title: self.parent.translations.Columns.Menu.Name,
                    filterable: true
                }, {
                    field: "UrlFilter",
                    title: self.parent.translations.Columns.Menu.UrlFilter,
                    filterable: true
                }, {
                    field: "Id",
                    title: " ",
                    template:
                        '<div class="btn-group">' +
                        '<button type="button" data-bind="click: menuModel.edit.bind($data,\'#=Id#\')" class="btn btn-default btn-sm" title="' + self.parent.translations.Edit + '"><i class="fa fa-edit"></i></button>' +
                        '<button type="button" data-bind="click: menuModel.remove.bind($data,\'#=Id#\')" class="btn btn-danger btn-sm" title="' + self.parent.translations.Delete + '"><i class="fa fa-remove"></i></button>' +
                        '<button type="button" data-bind="click: menuModel.items.bind($data,\'#=Id#\')" class="btn btn-primary btn-sm" title="Items"><i class="fa fa-bars"></i></button>' +
                        '</div>',
                    attributes: { "class": "text-center" },
                    filterable: false,
                    width: 150
                }]
            });
        };
        self.create = function () {
            self.id(emptyGuid);
            self.name(null);
            self.urlFilter(null);

            self.validator.resetForm();
            switchSection($("#form-section"));
            $("#form-section-legend").html(self.parent.translations.Create);
        };
        self.edit = function (id) {
            $.ajax({
                url: "/odata/kore/cms/MenuApi(" + id + ")",
                type: "GET",
                dataType: "json",
                async: false
            })
            .done(function (json) {
                self.id(json.Id);
                self.name(json.Name);
                self.urlFilter(json.UrlFilter);

                self.validator.resetForm();
                switchSection($("#form-section"));
                $("#form-section-legend").html(self.parent.translations.Edit);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(self.parent.translations.GetRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        };
        self.remove = function (id) {
            if (confirm(self.parent.translations.DeleteRecordConfirm)) {
                $.ajax({
                    url: "/odata/kore/cms/MenuApi(" + id + ")",
                    type: "DELETE",
                    async: false
                })
                .done(function (json) {
                    $('#Grid').data('kendoGrid').dataSource.read();
                    $('#Grid').data('kendoGrid').refresh();

                    $.notify(self.parent.translations.DeleteRecordSuccess, "success");
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    $.notify(self.parent.translations.DeleteRecordError, "error");
                    console.log(textStatus + ': ' + errorThrown);
                });
            }
        };
        self.save = function () {

            if (!$("#form-section-form").valid()) {
                return false;
            }

            var record = {
                Id: self.id(),
                Name: self.name(),
                UrlFilter: self.urlFilter()
            };

            if (self.id() == emptyGuid) {
                // INSERT
                $.ajax({
                    url: "/odata/kore/cms/MenuApi",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(record),
                    dataType: "json",
                    async: false
                })
                .done(function (json) {
                    $('#Grid').data('kendoGrid').dataSource.read();
                    $('#Grid').data('kendoGrid').refresh();

                    switchSection($("#grid-section"));

                    $.notify(self.parent.translations.InsertRecordSuccess, "success");
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    $.notify(self.parent.translations.InsertRecordError, "error");
                    console.log(textStatus + ': ' + errorThrown);
                });
            }
            else {
                // UPDATE
                $.ajax({
                    url: "/odata/kore/cms/MenuApi(" + self.id() + ")",
                    type: "PUT",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(record),
                    dataType: "json",
                    async: false
                })
                .done(function (json) {
                    $('#Grid').data('kendoGrid').dataSource.read();
                    $('#Grid').data('kendoGrid').refresh();

                    switchSection($("#grid-section"));

                    $.notify(self.parent.translations.UpdateRecordSuccess, "success");
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    $.notify(self.parent.translations.UpdateRecordError, "error");
                    console.log(textStatus + ': ' + errorThrown);
                });
            }
        };
        self.cancel = function () {
            switchSection($("#grid-section"));
        };
        self.items = function (id) {
            self.id(id);// to support "Create" button for when parent ID is null (top level items)
            var itemsGrid = $("#ItemsGrid").data("kendoGrid");
            itemsGrid.dataSource.filter([{
                logic: "and",
                filters: [
                  { field: "MenuId", operator: "eq", value: self.id() },
                  { field: "ParentId", operator: "eq", value: null }
                ]
            }]);
            itemsGrid.dataSource.read();
            itemsGrid.refresh();
            switchSection($("#items-grid-section"));
        };
    };

    var ViewModel = function () {
        var self = this;

        self.gridPageSize = 10;
        self.translations = false;

        self.menuModel = false;
        self.menuItemModel = false;

        self.activate = function () {
            self.menuModel = new MenuModel(self);
            self.menuItemModel = new MenuItemModel(self);
        };
        self.attached = function () {
            currentSection = $("#grid-section");

            // Load translations first, else will have errors
            $.ajax({
                url: "/admin/menus/get-translations",
                type: "GET",
                dataType: "json",
                async: false
            })
            .done(function (json) {
                self.translations = json;
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus + ': ' + errorThrown);
            });

            self.gridPageSize = $("#GridPageSize").val();

            self.menuModel.init();
            self.menuItemModel.init();
        };
    };

    var viewModel = new ViewModel();
    return viewModel;
});