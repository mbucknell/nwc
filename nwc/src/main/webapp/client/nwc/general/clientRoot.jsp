
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
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/WaterCensusToolbar/js/WaterCensusControls.js"></script>

<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/FlowlineLayer/FlowlinesData.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/FlowlineLayer/FlowlinesRaster.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/GageLayer/GageData.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/GageLayer/GageFeature.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/openLayersExtensions/GageLayer/GageRaster.js"></script>


<!--services -->
<script type="text/javascript" src="${context}/client/nwc/general/services/util.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/DataSeriesStore.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/SosSources.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/SosResponseParser.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/CommonDictionary.js"></script>

<script type="text/javascript" src="${context}/client/nwc/state/watchModule.js"></script>
<script type="text/javascript" src="${context}/client/nwc/state/sharedStateServices.js"></script>
<script type="text/javascript" src="${context}/client/nwc/state/stateController.js"></script>

<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterBudgetPlot.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/BaseMap.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterBudgetMap.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/aquaticBiology/aquaticBiologyMap.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamflowMap.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/Conversion.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterBudgetServices.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterUsageChart.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamStats.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamflowDictionary.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/WpsClient.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/RdbParser.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/WaterYearUtil.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/services/Plotter.js"></script>

<!-- controllers -->
<script type="text/javascript" src="${context}/client/nwc/general/controllers/controllerHelpers.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/AllWorkflowController.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/waterBudget/waterBudgetControllers.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/aquaticBiology/aquaticBiologyControllers.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamflowStatisticsControllers.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/dataDiscovery/dataDiscoveryControllers.js"></script>

<!-- directives -->
<script type="text/javascript" src="${context}/client/nwc/general/directives/selectionInfoDirectives.js"></script>
<script type="text/javascript" src="${context}/client/nwc/general/directives/downloadDataDirective.js"></script>
<script type="text/javascript" src="${context}/client/nwc/workflows/streamflowStatistics/streamflowStatisticsDirectives.js"></script>

<!-- main app-->
<script type="text/javascript" src="${context}/client/nwc/general/app.js"></script>



<div class="angularRoot"  ng-app="nwcApp">
    <div ui-view></div>
</div>
