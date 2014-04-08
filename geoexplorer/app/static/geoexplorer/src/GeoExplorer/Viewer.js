/**
 * @requires GeoExplorer/Base.js
 */

Ext.define('GeoExplorer.Viewer', {
    extend: 'GeoExplorer.Base',
    applyConfig: function(config) {
        var allTools = config.viewerTools || this.viewerTools;
        var tools = [];
        var toolConfig;
        for (var i=0, len=allTools.length; i<len; i++) {
            var tool = allTools[i];
            if (tool.checked === true) {
                var properties = ['checked', 'iconCls', 'id', 'leaf', 'loader', 'text'];
                for (var key in properties) {
                    delete tool[properties[key]];
                }
                toolConfig = Ext.applyIf({
                    actionTarget: "paneltbar"
                }, tool);
                tools.push(toolConfig);
            }
        }
        config.tools = tools;
        this.callParent(arguments);
    },
    initPortal: function() {
        this.toolbar = Ext.create('Ext.Toolbar', {
            disabled: true,
            id: "paneltbar"
        });
        this.on("ready", function() {this.toolbar.enable();}, this);

        this.mapPanelContainer = Ext.create('Ext.Panel', {
            layout: "card",
            region: "center",
            defaults: {
                border: false
            },
            items: [
                this.mapPanel/*,
                new gxp.GoogleEarthPanel({
                    mapPanel: this.mapPanel,
                    listeners: {
                        beforeadd: function(record) {
                            return record.get("group") !== "background";
                        }
                    }
                })*/
            ],
            activeItem: 0
        });

        this.portalItems = [{
            region: "center",
            layout: "border",
            tbar: this.toolbar,
            items: [
                this.mapPanelContainer
            ]
        }];
        this.callParent(arguments);
    }
});
