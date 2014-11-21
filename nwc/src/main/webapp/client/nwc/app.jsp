
<%-- 
    Place any dependencies specific to the entire angular app here.
    Step-specific or workflow-specific dependencies can be loaded in the 
    templates for those steps or workflows.
--%>
<%
String timestamp = "" + System.currentTimeMillis();
%>

<!--library dependencies -->
<script type="text/javascript" src="${context}/webjars/angularjs/${angularVersion}/angular${jsMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/angular-ui-router/${angularUiRouterVersion}/angular-ui-router${jsMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/angular-ui-bootstrap/${angularUiBootstrapVersion}/ui-bootstrap${jsMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/angular-ui-bootstrap/${angularUiBootstrapVersion}/ui-bootstrap-tpls${jsMin}.js"></script>

<script type="text/javascript" src="${context}/webjars/ng-grid/${angularUiGridVersion}/ng-grid${jsMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/sugar/${sugarVersion}/sugar-full${sugarMin}.js"></script>
<script type="text/javascript" src="${context}/webjars/openlayers/${openlayersVersion}/OpenLayers${openlayersMin}.js"></script>
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
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/WaterCensusToolbar/js/WaterCensusControls.js?nocache=<%=timestamp%>"></script>

<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/FlowlineLayer/FlowlinesData.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/FlowlineLayer/FlowlinesRaster.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/GageLayer/GageData.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/GageLayer/GageFeature.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/GageLayer/GageRaster.js?nocache=<%=timestamp%>"></script>


<!--services -->
<script type="text/javascript" src="${context}/client/nwc/general/services/util.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/DataSeriesStore.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/SosSources.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/SosResponseParser.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/CommonDictionary.js?nocache=<%=timestamp%>"></script>

<script type="text/javascript" src="${context}/client/nwc/state/watchModule.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/state/sharedStateServices.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/state/stateController.js?nocache=<%=timestamp%>"></script>

<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterBudgetPlot.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/BaseMap.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterBudgetMap.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/aquaticBiology/aquaticBiologyMap.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamflowMap.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/Conversion.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterBudgetServices.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterUsageChart.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamStats.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamflowDictionary.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/WpsClient.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/RdbParser.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/WaterYearUtil.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/Plotter.js?nocache=<%=timestamp%>"></script>

<!-- directives -->
<script type="text/javascript" src="${context}/client/nwc/general/directives/selectionInfoDirectives.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/directives/downloadDataDirective.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamflowStatisticsDirectives.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/directives/GageList/GageList.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/general/directives/HucList/HucList.js?nocache=<%=timestamp%>"></script>

<!-- controllers -->
<script type="text/javascript" src="${context}/client/nwc/general/controllers/controllerHelpers.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterBudgetControllers.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/aquaticBiology/aquaticBiologyControllers.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamflowStatisticsControllers.js?nocache=<%=timestamp%>"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/dataDiscovery/dataDiscoveryControllers.js?nocache=<%=timestamp%>"></script>

<!-- main app-->
<script type="text/javascript" src="${context}/client/nwc/app.js?nocache=<%=timestamp%>"></script>



<div class="angularRoot"  ng-app="nwcApp">
    <div ui-view></div>
</div>
