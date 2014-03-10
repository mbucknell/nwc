<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%-- 
    Place any dependencies specific to the entire angular app here.
    Step-specific or workflow-specific dependencies can be loaded in the 
    templates for those steps or workflows.
--%>
<!--library dependencies -->
<script type="text/javascript" src="../webjars/angularjs/${angular-version}/angular.js"></script>
<script type="text/javascript" src="../webjars/angular-ui-router/${angular-ui-router-version}/angular-ui-router.js"></script>
<script type="text/javascript" src="../webjars/angular-ui-bootstrap/${angular-ui-bootstrap-version}/ui-bootstrap.js"></script>
<script type="text/javascript" src="../webjars/angular-ui-bootstrap/${angular-ui-bootstrap-version}/ui-bootstrap-tpls.js"></script>

<script type="text/javascript" src="../webjars/ng-grid/${angular-ui-grid-version}/ng-grid.js"></script>
<script type="text/javascript" src="../webjars/sugar/${sugar-version}/sugar-full.development.js"></script>
<script type="text/javascript" src="../webjars/openlayers/${openlayers-version}/OpenLayers.debug.js"></script>
<!--<Order is important> -->
<script type="text/javascript" src="../gov.usgs.cida.jslibs/openlayers/extension/Raster.js"></script>
<script type="text/javascript" src="../gov.usgs.cida.jslibs/openlayers/extension/Layer/Raster.js"></script>
<script type="text/javascript" src="../gov.usgs.cida.jslibs/openlayers/extension/Raster/Grid.js"></script>
<script type="text/javascript" src="../gov.usgs.cida.jslibs/openlayers/extension/Raster/Operation.js"></script>
<script type="text/javascript" src="../gov.usgs.cida.jslibs/openlayers/extension/Raster/Composite.js"></script>
<!--</Order is important> -->

<script type="text/javascript" src="../3rdparty/dygraphs/dygraph-dev.js"></script>
<script type="text/javascript" src="../webjars/flot/${flotcharts-version}/jquery.flot.js"></script>
<script type="text/javascript" src="../webjars/flot/${flotcharts-version}/jquery.flot.resize.js"></script>
<script type="text/javascript" src="../webjars/flot/${flotcharts-version}/jquery.flot.time.js"></script>
<script type="text/javascript" src="../webjars/flot/${flotcharts-version}/jquery.flot.stack.js"></script>
<script type="text/javascript" src="../3rdparty/flot-plugins/jquery.flot.tooltip.js"></script>
<script type="text/javascript" src="../3rdparty/flot-plugins/jquery.flot.axislabels.js"></script>

<script type="text/javascript" src="../3rdparty/checklist-model/checklist-model.js"></script>
<!-- misc -->
<script type="text/javascript" src="../client/nwc/general/openLayersExtensions/WaterCensusToolbar/js/WaterCensusToolbar.js"></script>

<script type="text/javascript" src="../client/nwc/general/openLayersExtensions/FlowlineLayer/FlowlinesData.js"></script>
<script type="text/javascript" src="../client/nwc/general/openLayersExtensions/FlowlineLayer/FlowlinesRaster.js"></script>
<script type="text/javascript" src="../client/nwc/general/openLayersExtensions/GageLayer/GageData.js"></script>
<script type="text/javascript" src="../client/nwc/general/openLayersExtensions/GageLayer/GageFeature.js"></script>
<script type="text/javascript" src="../client/nwc/general/openLayersExtensions/GageLayer/GageRaster.js"></script>


<!--services -->
<script type="text/javascript" src="../client/nwc/general/services/util.js"></script>
<script type="text/javascript" src="../client/nwc/general/services/DataSeriesStore.js"></script>
<script type="text/javascript" src="../client/nwc/general/services/SosSources.js"></script>
<script type="text/javascript" src="../client/nwc/general/services/SosResponseParser.js"></script>

<script type="text/javascript" src="../client/nwc/state/watchModule.js"></script>
<script type="text/javascript" src="../client/nwc/state/sharedStateServices.js"></script>
<script type="text/javascript" src="../client/nwc/state/stateController.js"></script>

<script type="text/javascript" src="../client/nwc/workflows/waterBudget/waterBudgetPlot.js"></script>
<script type="text/javascript" src="../client/nwc/general/services/baseMap.js"></script>
<script type="text/javascript" src="../client/nwc/workflows/waterBudget/waterBudgetMap.js"></script>
<script type="text/javascript" src="../client/nwc/workflows/aquaticBiology/aquaticBiologyMap.js"></script>
<script type="text/javascript" src="../client/nwc/workflows/streamflowStatistics/streamflowMap.js"></script>
<script type="text/javascript" src="../client/nwc/general/services/Conversion.js"></script>
<script type="text/javascript" src="../client/nwc/workflows/waterBudget/waterUsageChart.js"></script>
<script type="text/javascript" src="../client/nwc/workflows/streamflowStatistics/streamStats.js"></script>
<script type="text/javascript" src="../client/nwc/workflows/streamflowStatistics/statisticDescriptions.js"></script>
<script type="text/javascript" src="../client/nwc/general/services/WpsClient.js"></script>
<script type="text/javascript" src="../client/nwc/general/services/RdbParser.js"></script>

<!-- controllers -->
<script type="text/javascript" src="../client/nwc/general/controllers/controllerHelpers.js"></script>
<script type="text/javascript" src="../client/nwc/workflows/AllWorkflowController.js"></script>
<script type="text/javascript" src="../client/nwc/workflows/waterBudget/waterBudgetControllers.js"></script>
<script type="text/javascript" src="../client/nwc/workflows/aquaticBiology/aquaticBiologyControllers.js"></script>
<script type="text/javascript" src="../client/nwc/workflows/streamflowStatistics/streamflowStatisticsControllers.js"></script>

<!-- main app-->
<script type="text/javascript" src="../client/nwc/general/app.js"></script>



<div class="angularRoot"  ng-app="nwcApp">
    <div ui-view></div>
</div>
