/**
 * @requires plugins/Tool.js
 * @requires menu/Layer.js
 */

Ext.define('GeoExplorer.plugins.LayerChooser', {
    extend: 'gxp.plugins.Tool',
    alias: 'plugin.geoexplorer_layerchooser',
    addActions: function() {
        var actions = [Ext.create('GeoExt.Action', {
            id: "layerchooser",
            tooltip: 'Layer Switcher',
            iconCls: 'icon-layer-switcher',
            menu: Ext.create('gxp.menu.Layer', {
                layers: this.target.mapPanel.layers
            })
        })];
        return GeoExplorer.plugins.LayerChooser.superclass.addActions.apply(this, [actions]);
    }
});
