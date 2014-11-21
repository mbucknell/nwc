
<%-- 
    Place any dependencies specific to the entire angular app here.
    Step-specific or workflow-specific dependencies can be loaded in the 
    templates for those steps or workflows.
--%>
<!--library dependencies -->
<script type="text/javascript" src="${context}/webjars/angularjs/${angularVersion}/angular${jsMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/angular-ui-router/${angularUiRouterVersion}/angular-ui-router${jsMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/angular-ui-bootstrap/${angularUiBootstrapVersion}/ui-bootstrap${jsMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/angular-ui-bootstrap/${angularUiBootstrapVersion}/ui-bootstrap-tpls${jsMin}.js"></script>

<script type="text/javascript" src="${context}/webjars/ng-grid/${angularUiGridVersion}/ng-grid${jsMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/sugar/${sugarVersion}/sugar-full${sugarMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/openlayers/${openlayersVersion}/OpenLayers${openlayersMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/jsts/${jstsVersion}/javascript.util.js"></script>
<script type="text/javascript" src="${context}/webjars/jsts/${jstsVersion}/jsts.js"></script>

<!-- IE11 serializes the WFS call and adds an extra empty namespace attribute (NS1), this override strips it out -->
<script type="text/javascript"> 
(function() {
	var _class = OpenLayers.Format.XML;
	var originalWriteFunction = _class.prototype.write;
	var patchedWriteFunction = function()
	{
		var child = originalWriteFunction.apply( this, arguments );
		
		// NOTE: Remove the rogue namespaces as one block of text.
		//       The second fragment "NS1:" is too small on its own and could cause valid text (in, say, ogc:Literal elements) to be erroneously removed.
		child = child.replace( new RegExp( 'xmlns:NS1="" NS1:', 'g' ), '' );
		
		return child;
	}
	_class.prototype.write = patchedWriteFunction;
}());
</script>
<!--<Order is important> -->
<script type="text/javascript" src="${context}/gov.usgs.cida.jslibs/openlayers/extension/Raster.js"></script>
<script type="text/javascript" src="${context}/gov.usgs.cida.jslibs/openlayers/extension/Layer/Raster.js"></script>
<script type="text/javascript" src="${context}/gov.usgs.cida.jslibs/openlayers/extension/Raster/Grid.js"></script>
<script type="text/javascript" src="${context}/gov.usgs.cida.jslibs/openlayers/extension/Raster/Operation.js"></script>
<script type="text/javascript" src="${context}/gov.usgs.cida.jslibs/openlayers/extension/Raster/Composite.js"></script>
<!--</Order is important> -->

<script type="text/javascript" src="${context}/3rdparty/dygraphs/dygraph${dygraphsMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/flot/${flotchartsVersion}/jquery.flot${jsMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/flot/${flotchartsVersion}/jquery.flot.resize${jsMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/flot/${flotchartsVersion}/jquery.flot.time${jsMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/flot/${flotchartsVersion}/jquery.flot.stack${jsMin}.js"></script>
<script type="text/javascript" src="${context}/3rdparty/flot-plugins/jquery.flot.tooltip.js"></script>
<script type="text/javascript" src="${context}/3rdparty/flot-plugins/jquery.flot.axislabels.js"></script>

<script type="text/javascript" src="${context}/3rdparty/checklist-model/checklist-model.js"></script>
<!-- misc -->
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/WaterCensusToolbar/js/WaterCensusControls.js?version=${applicationVersion}"></script>

<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/FlowlineLayer/FlowlinesData.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/FlowlineLayer/FlowlinesRaster.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/GageLayer/GageData.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/GageLayer/GageFeature.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/GageLayer/GageRaster.js?version=${applicationVersion}"></script>


<!--services -->
<script type="text/javascript" src="${context}/client/nwc/general/services/util.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/DataSeriesStore.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/SosSources.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/SosResponseParser.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/CommonDictionary.js?version=${applicationVersion}"></script>

<script type="text/javascript" src="${context}/client/nwc/state/watchModule.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/state/sharedStateServices.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/state/stateController.js?version=${applicationVersion}"></script>

<script type="text/javascript" src="${context}/client/nwc/general/services/BaseMap.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterBudgetMap.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/aquaticBiology/aquaticBiologyMap.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamflowMap.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/Conversion.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterBudgetServices.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterUsageChart.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamStats.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamflowDictionary.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/WpsClient.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/RdbParser.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/WaterYearUtil.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/Plotter.js?version=${applicationVersion}"></script>

<!-- directives -->
<script type="text/javascript" src="${context}/client/nwc/general/directives/selectionInfoDirectives.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/directives/downloadDataDirective.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/directives/featureMap.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamflowStatisticsDirectives.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/directives/GageList/GageList.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/general/directives/HucList/HucList.js?version=${applicationVersion}"></script>

<!-- controllers -->
<script type="text/javascript" src="${context}/client/nwc/general/controllers/controllerHelpers.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterBudgetControllers.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/aquaticBiology/aquaticBiologyControllers.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamflowStatisticsControllers.js?version=${applicationVersion}"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/dataDiscovery/dataDiscoveryControllers.js?version=${applicationVersion}"></script>

<!-- main app-->
<script type="text/javascript" src="${context}/client/nwc/app.js?version=${applicationVersion}"></script>



<div class="angularRoot"  ng-app="nwcApp">
    <div ui-view></div>
</div>
