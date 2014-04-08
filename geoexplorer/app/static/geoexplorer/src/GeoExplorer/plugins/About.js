/**
 * @requires plugins/Tool.js
 */

Ext.define('GeoExplorer.plugins.About', {
    extend: 'gxp.plugins.Tool',
    alias: 'plugin.geoexplorer_about',
    addActions: function() {
        var actions = [Ext.create('GeoExt.Action', {
            id: "aboutbutton",
            text: this.target.appInfoText,
            iconCls: "icon-geoexplorer",
            handler: this.target.displayAppInfo,
            scope: this.target
        })];
        return GeoExplorer.plugins.About.superclass.addActions.apply(this, [actions]);
    }
});
