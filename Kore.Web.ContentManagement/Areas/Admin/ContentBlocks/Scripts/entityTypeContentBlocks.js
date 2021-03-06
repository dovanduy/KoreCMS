﻿define(function (require) {
    'use strict'

    var router = require('plugins/router');
    var $ = require('jquery');
    var ko = require('knockout');
    var koMap = require('knockout-mapping');

    require('jqueryval');
    require('kendo');
    require('notify');
    require('tinymce');
    require('tinymce-jquery');
    require('tinymce-knockout');

    require('kore-common');
    require('kore-section-switching');
    require('kore-jqueryval');
    require('kore-chosen-knockout');
    require('kore-tinymce');

    ko.mapping = koMap;

    var BlockModel = function (parent) {
        var self = this;

        self.parent = parent;
        self.id = ko.observable(emptyGuid);
        self.entityType = ko.observable(self.parent.entityType);
        self.entityId = ko.observable(self.parent.entityId);
        self.blockName = ko.observable(null);
        self.blockType = ko.observable(null);
        self.title = ko.observable(null);
        self.zoneId = ko.observable(emptyGuid);
        self.order = ko.observable(0);
        self.isEnabled = ko.observable(false);
        self.blockValues = ko.observable(null);
        self.customTemplatePath = ko.observable(null);

        self.cultureCode = ko.observable(null);

        self.createFormValidator = false;
        self.editFormValidator = false;

        self.contentBlockModelStub = null;

        self.init = function () {
            self.createFormValidator = $("#create-section-form").validate({
                rules: {
                    Create_Title: { required: true, maxlength: 255 }
                }
            });

            self.editFormValidator = $("#edit-section-form").validate({
                rules: {
                    Title: { required: true, maxlength: 255 },
                    BlockName: { required: true, maxlength: 255 },
                    BlockType: { maxlength: 1024 }
                }
            });

            $("#Grid").kendoGrid({
                data: null,
                dataSource: {
                    type: "odata",
                    transport: {
                        read: {
                            url: "/odata/kore/cms/EntityTypeContentBlockApi?$filter=EntityType eq '" + self.parent.entityType + "' and EntityId eq '" + self.parent.entityId + "'",
                            dataType: "json"
                        },
                        parameterMap: function (options, operation) {
                            var paramMap = kendo.data.transports.odata.parameterMap(options);
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
                            fields: {
                                Title: { type: "string" },
                                BlockName: { type: "string" },
                                Order: { type: "number" },
                                IsEnabled: { type: "boolean" }
                            }
                        }
                    },
                    pageSize: self.parent.gridPageSize,
                    serverPaging: true,
                    serverFiltering: true,
                    serverSorting: true,
                    sort: { field: "Title", dir: "asc" }
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
                    field: "Title",
                    title: self.parent.translations.Columns.Title,
                    filterable: true
                }, {
                    field: "BlockName",
                    title: self.parent.translations.Columns.BlockType,
                    filterable: true
                }, {
                    field: "Order",
                    title: self.parent.translations.Columns.Order,
                    filterable: false
                }, {
                    field: "IsEnabled",
                    title: self.parent.translations.Columns.IsEnabled,
                    template: '<i class="fa #=IsEnabled ? \'fa-check text-success\' : \'fa-times text-danger\'#"></i>',
                    attributes: { "class": "text-center" },
                    filterable: true,
                    width: 70
                }, {
                    field: "Id",
                    title: " ",
                    template:
                        '<div class="btn-group">' +
                        '<button type="button" data-bind="click: blockModel.edit.bind($data,\'#=Id#\', null)" class="btn btn-default btn-sm" title="' + self.parent.translations.Edit + '"><i class="fa fa-edit"></i></button>' +
                        '<button type="button" data-bind="click: blockModel.localize.bind($data,\'#=Id#\')" class="btn btn-success btn-sm" title="' + self.parent.translations.Localize + '"><i class="fa fa-globe"></i></button>' +
                        '<button type="button" data-bind="click: blockModel.remove.bind($data,\'#=Id#\')" class="btn btn-danger btn-sm" title="' + self.parent.translations.Delete + '"><i class="fa fa-remove"></i></button>' +
                        '<button type="button" data-bind="click: blockModel.toggleEnabled.bind($data,\'#=Id#\', #=IsEnabled#)" class="btn btn-default btn-sm" title="' + self.parent.translations.Toggle + '"><i class="fa #=IsEnabled ? \'fa-toggle-on text-success\' : \'fa-toggle-off text-danger\'#"></i></button>' +
                        '</div>',
                    attributes: { "class": "text-center" },
                    filterable: false,
                    width: 200
                }]
            });
        };
        self.create = function () {
            self.id(emptyGuid);
            self.entityType(self.parent.entityType);
            self.entityId(self.parent.entityId);
            self.blockName(null);
            self.blockType(null);
            self.title(null);
            self.zoneId(emptyGuid);
            self.order(0);
            self.isEnabled(false);
            self.blockValues(null);
            self.customTemplatePath(null);

            self.cultureCode(null);

            // Clean up from previously injected html/scripts
            if (self.contentBlockModelStub != null && typeof self.contentBlockModelStub.cleanUp === 'function') {
                self.contentBlockModelStub.cleanUp(self);
            }
            self.contentBlockModelStub = null;

            // Remove Old Scripts
            var oldScripts = $('script[data-block-script="true"]');

            if (oldScripts.length > 0) {
                $.each(oldScripts, function () {
                    $(this).remove();
                });
            }

            var elementToBind = $("#block-details")[0];
            ko.cleanNode(elementToBind);
            $("#block-details").html("");

            self.createFormValidator.resetForm();
            switchSection($("#create-section"));
        };
        self.edit = function (id, cultureCode) {
            var url = "/odata/kore/cms/EntityTypeContentBlockApi(" + id + ")";

            if (cultureCode) {
                self.cultureCode(cultureCode);
                url = "/odata/kore/cms/EntityTypeContentBlockApi/Default.GetLocalized(id=" + id + ",cultureCode='" + cultureCode + "')";
            }
            else {
                self.cultureCode(null);
            }

            $.ajax({
                url: url,
                type: "GET",
                //contentType: "application/json; charset=utf-8",
                dataType: "json",
                async: false
            })
            .done(function (json) {
                self.id(json.Id);
                self.entityType(json.EntityType);
                self.entityId(json.EntityId);
                self.blockName(json.BlockName);
                self.blockType(json.BlockType);
                self.title(json.Title);
                self.zoneId(json.ZoneId);
                self.order(json.Order);
                self.isEnabled(json.IsEnabled);
                self.blockValues(json.BlockValues);
                self.customTemplatePath(json.CustomTemplatePath);

                $.ajax({
                    url: "/admin/blocks/entity-type-content-blocks/get-editor-ui/" + self.id(),
                    type: "GET",
                    dataType: "json",
                    async: false
                })
                .done(function (json) {

                    // Clean up from previously injected html/scripts
                    if (self.contentBlockModelStub != null && typeof self.contentBlockModelStub.cleanUp === 'function') {
                        self.contentBlockModelStub.cleanUp(self);
                    }
                    self.contentBlockModelStub = null;

                    // Remove Old Scripts
                    var oldScripts = $('script[data-block-script="true"]');

                    if (oldScripts.length > 0) {
                        $.each(oldScripts, function () {
                            $(this).remove();
                        });
                    }

                    var elementToBind = $("#block-details")[0];
                    ko.cleanNode(elementToBind);
                    $("#block-details").html("");

                    var result = $(json.Content);

                    // Add new HTML
                    var content = $(result.filter('#block-content')[0]);
                    var details = $('<div>').append(content.clone()).html();
                    $("#block-details").html(details);

                    // Add new Scripts
                    var scripts = result.filter('script');

                    $.each(scripts, function () {
                        var script = $(this);
                        script.attr("data-block-script", "true");//for some reason, .data("block-script", "true") doesn't work here
                        script.appendTo('body');
                    });

                    // Update Bindings
                    // Ensure the function exists before calling it...
                    if (typeof contentBlockModel != null) {
                        self.contentBlockModelStub = contentBlockModel;
                        if (typeof self.contentBlockModelStub.updateModel === 'function') {
                            self.contentBlockModelStub.updateModel(self);
                        }
                        ko.applyBindings(self.parent, elementToBind);
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    $.notify(self.parent.translations.GetRecordError, "error");
                    console.log(textStatus + ': ' + errorThrown);
                });

                self.editFormValidator.resetForm();
                switchSection($("#edit-section"));
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(self.parent.translations.GetRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        };
        self.localize = function (id) {
            $("#SelectedId").val(id);
            $("#cultureModal").modal("show");
        };
        self.onCultureSelected = function () {
            var id = $("#SelectedId").val();
            var cultureCode = $("#CultureCode").val();
            self.edit(id, cultureCode);
            $("#cultureModal").modal("hide");
        };
        self.remove = function (id) {
            if (confirm(self.parent.translations.DeleteRecordConfirm)) {
                $.ajax({
                    url: "/odata/kore/cms/EntityTypeContentBlockApi(" + id + ")",
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
            var isNew = (self.id() == emptyGuid);

            if (isNew) {
                if (!$("#create-section-form").valid()) {
                    return false;
                }
            }
            else {
                if (!$("#edit-section-form").valid()) {
                    return false;
                }
            }

            // ensure the function exists before calling it...
            if (self.contentBlockModelStub != null && typeof self.contentBlockModelStub.onBeforeSave === 'function') {
                self.contentBlockModelStub.onBeforeSave(self);
            }

            var record = {
                Id: self.id(),
                EntityType: self.entityType(),
                EntityId: self.entityId(),
                BlockName: self.blockName(),
                BlockType: self.blockType(),
                Title: self.title(),
                ZoneId: self.zoneId(),
                Order: self.order(),
                IsEnabled: self.isEnabled(),
                BlockValues: self.blockValues(),
                CustomTemplatePath: self.customTemplatePath()
            };

            if (isNew) {
                $.ajax({
                    url: "/odata/kore/cms/EntityTypeContentBlockApi",
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
                if (self.cultureCode() != null) {
                    $.ajax({
                        url: "/odata/kore/cms/EntityTypeContentBlockApi/Default.SaveLocalized",
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify({
                            cultureCode: self.cultureCode(),
                            entity: record
                        }),
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
                else {
                    $.ajax({
                        url: "/odata/kore/cms/EntityTypeContentBlockApi(" + self.id() + ")",
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
            }
        };
        self.cancel = function () {
            // Clean up from previously injected html/scripts
            if (self.contentBlockModelStub != null && typeof self.contentBlockModelStub.cleanUp === 'function') {
                self.contentBlockModelStub.cleanUp(self);
            }
            self.contentBlockModelStub = null;

            // Remove Old Scripts
            var oldScripts = $('script[data-block-script="true"]');

            if (oldScripts.length > 0) {
                $.each(oldScripts, function () {
                    $(this).remove();
                });
            }

            var elementToBind = $("#block-details")[0];
            ko.cleanNode(elementToBind);
            $("#block-details").html("");

            switchSection($("#grid-section"));
        };
        self.toggleEnabled = function (id, isEnabled) {
            var patch = {
                IsEnabled: !isEnabled
            };

            $.ajax({
                url: "/odata/kore/cms/EntityTypeContentBlockApi(" + id + ")",
                type: "PATCH",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(patch),
                dataType: "json",
                async: false
            })
            .done(function (json) {
                $('#Grid').data('kendoGrid').dataSource.read();
                $('#Grid').data('kendoGrid').refresh();

                $.notify(self.parent.translations.UpdateRecordSuccess, "success");
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(self.parent.translations.UpdateRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        };
    };

    var ZoneModel = function (parent) {
        var self = this;

        self.parent = parent;
        self.id = ko.observable(emptyGuid);
        self.name = ko.observable(null);

        self.validator = false;

        self.init = function () {
            self.validator = $("#zone-edit-section-form").validate({
                rules: {
                    Zone_Name: { required: true, maxlength: 255 }
                }
            });

            $("#ZoneGrid").kendoGrid({
                data: null,
                dataSource: {
                    type: "odata",
                    transport: {
                        read: {
                            url: "/odata/kore/cms/ZoneApi",
                            dataType: "json"
                        },
                        parameterMap: function (options, operation) {
                            var paramMap = kendo.data.transports.odata.parameterMap(options);
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
                            fields: {
                                Name: { type: "string" }
                            }
                        }
                    },
                    pageSize: self.parent.gridPageSize,
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
                    title: self.parent.translations.Columns.Name,
                    filterable: true
                }, {
                    field: "Id",
                    title: " ",
                    template:
                        '<div class="btn-group">' +
                        '<button type="button" data-bind="click: zoneModel.edit.bind($data,\'#=Id#\')" class="btn btn-default btn-sm" title="' + self.parent.translations.Edit + '"><i class="fa fa-edit"></i></button>' +
                        '<button type="button" data-bind="click: zoneModel.remove.bind($data,\'#=Id#\')" class="btn btn-danger btn-sm" title="' + self.parent.translations.Delete + '"><i class="fa fa-remove"></i></button>' +
                        '</div>',
                    attributes: { "class": "text-center" },
                    filterable: false,
                    width: 100
                }]
            });
        };
        self.create = function () {
            self.id(emptyGuid);
            self.name(null);
            self.validator.resetForm();
            switchSection($("#zones-edit-section"));
        };
        self.edit = function (id) {
            $.ajax({
                url: "/odata/kore/cms/ZoneApi(" + id + ")",
                type: "GET",
                dataType: "json",
                async: false
            })
            .done(function (json) {
                self.id(json.Id);
                self.name(json.Name);
                self.validator.resetForm();
                switchSection($("#zones-edit-section"));
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(self.parent.translations.GetRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        };
        self.remove = function (id) {
            if (confirm(self.parent.translations.DeleteRecordConfirm)) {
                $.ajax({
                    url: "/odata/kore/cms/ZoneApi(" + id + ")",
                    type: "DELETE",
                    dataType: "json",
                    async: false
                })
                .done(function (json) {
                    $('#ZoneGrid').data('kendoGrid').dataSource.read();
                    $('#ZoneGrid').data('kendoGrid').refresh();

                    $('#ZoneId option[value="' + id + '"]').remove();
                    $('#Create_ZoneId option[value="' + id + '"]').remove();

                    $.notify(self.parent.translations.DeleteRecordSuccess, "success");
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    $.notify(self.parent.translations.DeleteRecordError, "error");
                    console.log(textStatus + ': ' + errorThrown);
                });
            }
        };
        self.save = function () {
            if (!$("#zone-edit-section-form").valid()) {
                return false;
            }

            var record = {
                Id: self.id(),
                Name: self.name(),
            };

            if (self.id() == emptyGuid) {
                // INSERT
                $.ajax({
                    url: "/odata/kore/cms/ZoneApi",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(record),
                    dataType: "json",
                    async: false
                })
                .done(function (json) {
                    $('#ZoneGrid').data('kendoGrid').dataSource.read();
                    $('#ZoneGrid').data('kendoGrid').refresh();

                    switchSection($("#zones-grid-section"));

                    // Update zone drop downs
                    $('#ZoneId').append($('<option>', {
                        value: json.Id,
                        text: record.Name
                    }));
                    $('#Create_ZoneId').append($('<option>', {
                        value: json.Id,
                        text: record.Name
                    }));

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
                    url: "/odata/kore/cms/ZoneApi(" + self.id() + ")",
                    type: "PUT",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(record),
                    dataType: "json",
                    async: false
                })
                .done(function (json) {
                    $('#ZoneGrid').data('kendoGrid').dataSource.read();
                    $('#ZoneGrid').data('kendoGrid').refresh();

                    switchSection($("#zones-grid-section"));

                    // Update zone drop downs
                    $('#ZoneId option[value="' + record.Id + '"]').text(record.Name);
                    $('#Create_ZoneId option[value="' + record.Id + '"]').text(record.Name);

                    $.notify(self.parent.translations.UpdateRecordSuccess, "success");
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    $.notify(self.parent.translations.UpdateRecordError, "error");
                    console.log(textStatus + ': ' + errorThrown);
                });
            }
        };
        self.cancel = function () {
            switchSection($("#zones-grid-section"));
        };
    };

    var ViewModel = function () {
        var self = this;

        self.gridPageSize = 10;
        self.entityType = null;
        self.entityId = null;
        self.translations = false;

        self.blockModel = false;
        self.zoneModel = false;

        self.activate = function (entityType, entityId) {
            self.entityType = entityType;
            self.entityId = entityId;

            self.blockModel = new BlockModel(self);
            self.zoneModel = new ZoneModel(self);
        };
        self.attached = function () {
            currentSection = $("#grid-section");

            // Load translations first, else will have errors
            $.ajax({
                url: "/admin/blocks/entity-type-content-blocks/get-translations",
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

            self.blockModel.init();
            self.zoneModel.init();
        };
        self.showBlocks = function () {
            switchSection($("#grid-section"));
        };
        self.showZones = function () {
            switchSection($("#zones-grid-section"));
        };
        self.goBack = function () {
            router.navigateBack();
        };
    };

    var viewModel = new ViewModel();
    return viewModel;
});