/**
 * @requires Viewer.js
 * @requires GeoExplorer/plugins/About.js
 * @requires GeoExplorer/plugins/LayerChooser.js
 */

Ext.USE_NATIVE_JSON = true;

Ext.define('GeoExplorer.Base', {
    requires: ['Ext.JSON'],
    extend: 'gxp.Viewer',
    // Begin i18n.
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
    // End i18n.
    aboutUrl: "../about.html",
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
        // both the Composer and the Viewer need to know about the viewerTools
        // First row in each object is needed to correctly render a tool in the treeview
        // of the embed map dialog. TODO: make this more flexible so this is not needed.
        config.viewerTools = [{
            hidden: true, ptype: "geoexplorer_layerchooser", checked: true
        }, {
            hidden: true, actions: ["-"], checked: true
        }/*, {
            leaf: true,
            text: gxp.plugins.Print.prototype.tooltip,
            ptype: "gxp_print",
            iconCls: "gxp-icon-print",
            customParams: {outputFilename: 'GeoExplorer-print'},
            printService: config.printService,
            checked: true
        }*/, {
            leaf: true,
            text: gxp.plugins.Navigation.prototype.tooltip,
            checked: true,
            iconCls: "gxp-icon-pan",
            ptype: "gxp_navigation",
            toggleGroup: "navigation"
        }, {
            leaf: true,
            text: gxp.plugins.WMSGetFeatureInfo.prototype.infoActionTip,
            checked: true,
            iconCls: "gxp-icon-getfeatureinfo",
            ptype: "gxp_wmsgetfeatureinfo",
            format: 'grid',
            toggleGroup: "interaction"
        }, {
            leaf: true,
            text: gxp.plugins.Measure.prototype.measureTooltip,
            checked: true,
            iconCls: "gxp-icon-measure-length",
            ptype: "gxp_measure",
            controlOptions: {immediate: true},
            toggleGroup: "interaction"
        }, {
            leaf: true,
            text: gxp.plugins.Zoom.prototype.zoomInTooltip + " / " + gxp.plugins.Zoom.prototype.zoomOutTooltip,
            checked: true,
            iconCls: "gxp-icon-zoom-in",
            ptype: "gxp_zoom"
        }, {
            leaf: true,
            text: gxp.plugins.NavigationHistory.prototype.previousTooltip + " / " + gxp.plugins.NavigationHistory.prototype.nextTooltip,
            checked: true,
            iconCls: "gxp-icon-zoom-previous",
            ptype: "gxp_navigationhistory"
        }, {
            leaf: true,
            text: gxp.plugins.ZoomToExtent.prototype.tooltip,
            checked: true,
            iconCls: gxp.plugins.ZoomToExtent.prototype.iconCls,
            ptype: "gxp_zoomtoextent"
        }/*, {
            leaf: true,
            text: gxp.plugins.Legend.prototype.tooltip,
            checked: true,
            iconCls: "gxp-icon-legend",
            ptype: "gxp_legend"
        }, {
            leaf: true,
            text: gxp.plugins.GoogleEarth.prototype.tooltip,
            checked: true,
            iconCls: "gxp-icon-googleearth",
            ptype: "gxp_googleearth"
        }*/, {
            hidden: true, actions: ["->"], checked: true
        }, {
            hidden: true, ptype: "geoexplorer_about", showButtonText: false, checked: true
        }];
        this.callParent(arguments);
    },
    loadConfig: function(config) {

        var mapUrl = window.location.hash.substr(1);
        var match = mapUrl.match(/^maps\/(\d+)$/);
        if (match) {
            this.id = Number(match[1]);
            Ext.Ajax.request({
                url: "../" + mapUrl,
                success: function(options, success, request) {
                    var addConfig = Ext.JSON.decode(request.responseText);
                    // Don't use persisted tool configurations from old maps
                    delete addConfig.tools;
                    this.applyConfig(Ext.applyIf(addConfig, config));
                },
                failure: function(options, success, request) {
                    var obj;
                    try {
                        obj = Ext.JSON.decode(request.responseText);
                    } catch (err) {
                        // pass
                    }
                    var msg = this.loadConfigErrorText;
                    if (obj && obj.error) {
                        msg += obj.error;
                    } else {
                        msg += this.loadConfigErrorDefaultText;
                    }
                    this.on({
                        ready: function() {
                            this.displayXHRTrouble(msg, request.status);
                        },
                        scope: this
                    });
                    delete this.id;
                    window.location.hash = "";
                    this.applyConfig(config);
                },
                scope: this
            });
        } else {
            var query = Ext.urlDecode(document.location.search.substr(1));
            if (query) {
                if (query.q) {
                    var queryConfig = Ext.JSON.decode(query.q);
                    Ext.apply(config, queryConfig);
                }
                /**
                 * Special handling for links from local GeoServer.
                 *
                 * The layers query string value indicates layers to add as
                 * overlays from the local source.
                 *
                 * The bbox query string value indicates the initial extent in
                 * the current map projection.
                 */
                 if (query.layers) {
                     var layers = query.layers.split(/\s*,\s*/);
                     for (var i=0,ii=layers.length; i<ii; ++i) {
                         config.map.layers.push({
                             source: "local",
                             name: layers[i],
                             visibility: true,
                             bbox: query.lazy && query.bbox ? query.bbox.split(",") : undefined
                         });
                     }
                 }
                 if (query.bbox) {
                     delete config.map.zoom;
                     delete config.map.center;
                     config.map.extent = query.bbox.split(/\s*,\s*/);
                 }
                 if (query.lazy && config.sources.local) {
                     config.sources.local.requiredProperties = [];
                 }
            }

            this.applyConfig(config);
        }

    },
    displayXHRTrouble: function(msg, status) {

        Ext.Msg.show({
            title: this.xhrTroubleText + status,
            msg: msg,
            icon: Ext.MessageBox.WARNING
        });

    },
    showUrl: function(request) {
        if (request.status == 200) {
            var win = new Ext.Window({
                title: this.bookmarkText,
                layout: 'form',
                labelAlign: 'top',
                modal: true,
                bodyStyle: "padding: 5px",
                width: 300,
                items: [{
                    xtype: 'textfield',
                    fieldLabel: this.permakinkText,
                    readOnly: true,
                    anchor: "100%",
                    selectOnFocus: true,
                    value: window.location.href
                }]
            });
            win.show();
            win.items.first().selectText();
        } else {
            var response = Ext.JSON.decode(request.responseText);
            this.displayXHRTrouble(response.error, request.status);
        }
    },
    getBookmark: function() {
        var params = Ext.apply(
            OpenLayers.Util.getParameters(),
            {q: Ext.JSON.encode(this.getState())}
        );

        // disregard any hash in the url, but maintain all other components
        var url =
            document.location.href.split("?").shift() +
            "?" + Ext.urlEncode(params);

        return url;
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
    getState: function() {
        var state = this.callParent(arguments);
        // Don't persist tools
        delete state.tools;
        return state;
    }
});
