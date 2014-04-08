/**
 * @requires Viewer.js
 */

Ext.define('GeoExplorer.Composer', {
    extend: 'gxp.Viewer',
    zoomSliderText: "<div>Zoom Level: {zoom}</div><div>Scale: 1:{scale}</div>",
    loadConfigErrorText: "Trouble reading saved configuration: <br />",
    loadConfigErrorDefaultText: "Server Error.",
    xhrTroubleText: "Communication Trouble: Status ",
    layersText: "Layers",
    titleText: "Title",
    bookmarkText: "Bookmark URL",
    permakinkText: 'Permalink',
    appInfoText: "GeoExplorer",
    aboutText: "About GeoExplorer",
    mapInfoText: "Map Info",
    descriptionText: "Description",
    contactText: "Contact",
    aboutThisMapText: "About this Map",
    aboutUrl: "../about.html",
    // from composer
    mapText: "Map",
    saveMapText: "Save map",
    exportMapText: "Export map",
    toolsTitle: "Choose tools to include in the toolbar:",
    previewText: "Preview",
    backText: "Back",
    nextText: "Next",
    loginText: "Login",
    logoutText: "Logout, {user}",
    loginErrorText: "Invalid username or password.",
    userFieldText: "User",
    passwordFieldText: "Password",
    tableText: "Table",
    queryText: "Query",
    logoutConfirmTitle: "Warning",
    logoutConfirmMessage: "Logging out will undo any unsaved changes, remove any layers you may have added, and reset the map composition. Do you want to save your composition first?",
    constructor: function(config) {
        this.mapItems = [{
            xtype: "gxp_scaleoverlay"
        }, {
            xtype: "gx_zoomslider",
            vertical: true,
            height: 100,
            plugins: Ext.create('GeoExt.slider.Tip', {
                getText: function(thumb) {
                     return Ext.String.format(
                         '<div>Zoom Level: {0}</div><div>Scale: 1:{1}</div>',
                         thumb.slider.getZoom(),
                         thumb.slider.getScale()
                     );
                }
            })
        }];
        config.tools = [{
            ptype: "gxp_layertree", /* TODO restore to layermanager */
            outputConfig: {
                id: "layers",
                tbar: [],
                title: this.layersText,
                autoScroll: true
            },
            outputTarget: "tree"
        }, {
            ptype: "gxp_addlayers",
            actionTarget: "layers.tbar",
            outputTarget: "tree",
            uploadSource: "local",
            postUploadAction: {
                plugin: "styler"
            },
            catalogSourceKey: "local",
            search: {
                selectedSource: "csw"
            }
        }, {
            ptype: "gxp_removelayer",
            actionTarget: ["layers.tbar", "layers.contextMenu"]
        }, {
            ptype: "gxp_layerproperties",
            id: "layerproperties",
            outputConfig: {defaults: {autoScroll: true}, width: 320},
            actionTarget: ["layers.tbar", "layers.contextMenu"],
            outputTarget: "tree"
        }/*, {
            ptype: "gxp_styler",
            id: "styler",
            outputConfig: {autoScroll: true, width: 320},
            actionTarget: ["layers.tbar", "layers.contextMenu"],
            outputTarget: "tree"
        }*/, {
            ptype: "gxp_zoomtolayerextent",
            actionTarget: {target: "layers.contextMenu", index: 0}
        }/*, {
            ptype: "gxp_googleearth",
            actionTarget: ["map.tbar", "globe.tbar"]
        }*/, {
            ptype: "gxp_navigation", toggleGroup: "navigation"
        }, {
            ptype: "gxp_zoom", toggleGroup: "navigation",
            showZoomBoxAction: true,
            controlOptions: {zoomOnClick: false}
        }, {
            ptype: "gxp_navigationhistory"
        }, {
            ptype: "gxp_zoomtoextent"
        }, {
            actions: [{
                id: "aboutbutton",
                text: this.appInfoText,
                iconCls: "icon-geoexplorer",
                handler: this.displayAppInfo,
                scope: this
            }], showButtonText: true, actionTarget: "paneltbar"
        }, {
            actions: ["-"], actionTarget: "paneltbar"
        }, {
            actions: [{
                id: "mapmenu",
                text: this.mapText,
                iconCls: 'icon-map',
                menu: new Ext.menu.Menu({
                    items: [{
                        text: this.exportMapText,
                        handler: function() {
                            this.doAuthorized(["ROLE_ADMINISTRATOR"], function() {
                                this.save(this.showEmbedWindow);
                            }, this);
                        },
                        scope: this,
                        iconCls: 'icon-export'
                    }, {
                        text: this.saveMapText,
                            handler: function() {
                                this.doAuthorized(["ROLE_ADMINISTRATOR"], function() {
                                    this.save(this.showUrl);
                                }, this);
                            },
                            scope: this,
                            iconCls: "icon-save"
                    }]
                })
            }],  showButtonText: true, actionTarget: "paneltbar"
        }/*, {
            ptype: "gxp_print",
            customParams: {outputFilename: 'GeoExplorer-print'},
            printService: config.printService,
            actionTarget: "paneltbar",
            showButtonText: true
        }*/, {
            actions: ["-"],
            actionTarget: "paneltbar"
        }, {
            ptype: "gxp_wmsgetfeatureinfo", format: 'html', /* TODO restore back to grid */
            toggleGroup: "interaction",
            showButtonText: true,
            actionTarget: "paneltbar"
        }, {
            ptype: "gxp_featuremanager",
            id: "querymanager",
            selectStyle: {cursor: ''},
            autoLoadFeatures: true,
            maxFeatures: 50,
            paging: true,
            pagingType: gxp.plugins.FeatureManager.WFS_PAGING
        }, {
            ptype: "gxp_queryform",
            showButtonText: true,
            featureManager: "querymanager",
            autoExpand: "query",
            actionTarget: "paneltbar",
            outputTarget: "query"
        }, {
            ptype: "gxp_featuregrid",
            featureManager: "querymanager",
            showTotalResults: true,
            autoLoadFeature: false,
            alwaysDisplayOnMap: true,
            controlOptions: {multiple: true},
            displayMode: "selected",
            outputTarget: "table",
            outputConfig: {
                id: "featuregrid",
                columnsSortable: false
            }
        }/*, {
            ptype: "gxp_zoomtoselectedfeatures",
            featureManager: "querymanager",
            actionTarget: ["featuregrid.contextMenu", "featuregrid.bbar"]
        }*/, {
            ptype: "gxp_measure", toggleGroup: "interaction",
            controlOptions: {immediate: true},
            showButtonText: true,
            actionTarget: "paneltbar"
        }, {
            ptype: "gxp_featuremanager",
            id: "featuremanager",
            maxFeatures: 20,
            paging: false
        }/*, {
            ptype: "gxp_featureeditor",
            featureManager: "featuremanager",
            autoLoadFeature: true,
            splitButton: true,
            showButtonText: true,
            toggleGroup: "interaction",
            actionTarget: "paneltbar"
        }*/, {
            actions: ["->"],
            actionTarget: "paneltbar"
        }, {
            actions: ["loginbutton"],
            actionTarget: "paneltbar"
        }];
        this.callParent(arguments);
    },
    displayAppInfo: function() {
        var appInfo = Ext.create('Ext.Panel', {
            title: this.appInfoText,
            html: "<iframe style='border: none; height: 100%; width: 100%' src='" + this.aboutUrl + "' frameborder='0' border='0'><a target='_blank' href='" + this.aboutUrl + "'>"+this.aboutText+"</a> </iframe>"
        });

        var about = Ext.applyIf(this.about, {
            title: '',
            "abstract": '',
            contact: ''
        });

        var mapInfo = Ext.create('Ext.Panel', {
            title: this.mapInfoText,
            html: '<div class="gx-info-panel">' +
                '<h2>'+this.titleText+'</h2><p>' + about.title +
                '</p><h2>'+this.descriptionText+'</h2><p>' + about['abstract'] +
                '</p> <h2>'+this.contactText+'</h2><p>' + about.contact +'</p></div>',
            height: 'auto',
            width: 'auto'
        });

        var tabs = Ext.create('Ext.TabPanel', {
            activeTab: 0,
            items: [mapInfo, appInfo]
        });

        var win = Ext.create('Ext.Window', {
            title: this.aboutThisMapText,
            modal: true,
            layout: "fit",
            width: 300,
            height: 300,
            items: [tabs]
        });
        win.show();
    },
    initPortal: function() {
        var westPanel = Ext.create('gxp.tab.CrumbPanel', {
            id: "tree",
            region: "west",
            width: 320,
            split: true,
            collapsible: true,
            collapseMode: "mini",
            hideCollapseTool: true,
            header: false
        });
        var southPanel = Ext.create('Ext.Panel', {
            region: "south",
            id: "south",
            height: 220,
            border: false,
            split: true,
            collapsible: true,
            collapseMode: "mini",
            collapsed: true,
            hideCollapseTool: true,
            header: false,
            layout: "border",
            items: [{
                region: "center",
                id: "table",
                title: this.tableText,
                layout: "fit"
            }, {
                region: "west",
                width: 320,
                id: "query",
                title: this.queryText,
                split: true,
                collapsible: true,
                collapseMode: "mini",
                collapsed: true,
                hideCollapseTool: true,
                layout: "fit"
            }]
        });
        var toolbar = Ext.create('Ext.Toolbar', {
            disabled: false,
            id: 'paneltbar',
            items: []
        });
        this.mapPanelContainer = Ext.create('Ext.Panel', {
            layout: "card",
            region: "center",
            defaults: {
                border: false
            },
            items: [
                this.mapPanel
            ],
            activeItem: 0
        });

        this.portalItems = [{
            region: "center",
            layout: "border",
            tbar: toolbar,
            items: [
                this.mapPanelContainer,
                westPanel,
                southPanel
            ]
        }];
        this.callParent(arguments);
    }

});
