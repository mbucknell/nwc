<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%-- 
    Place any dependencies specific to the entire angular app here.
    Step-specific or workflow-specific dependencies can be loaded in the 
    templates for those steps or workflows.
--%>
<!--library dependencies -->
<script type="text/javascript" src="../../webjars/angularjs/${angular-version}/angular.js"></script>
<script type="text/javascript" src="../../webjars/angular-ui-router/${angular-ui-router-version}/angular-ui-router.js"></script>
<script type="text/javascript" src="../../webjars/angular-ui-bootstrap/${angular-ui-bootstrap-version}/ui-bootstrap.js"></script>
<script type="text/javascript" src="../../webjars/angular-ui-bootstrap/${angular-ui-bootstrap-version}/ui-bootstrap-tpls.js"></script>
<script type="text/javascript" src="../../webjars/sugar/${sugar-version}/sugar-full.development.js"></script>
<script type="text/javascript" src="../../webjars/openlayers/${openlayers-version}/OpenLayers.debug.js"></script>
<script type="text/javascript" src="../../3rdparty/dygraphs/dygraph-dev.js"></script>
<script type="text/javascript" src="../../webjars/flot/${flotcharts-version}/jquery.flot.js"></script>
<script type="text/javascript" src="../../webjars/flot/${flotcharts-version}/jquery.flot.resize.js"></script>
<script type="text/javascript" src="../../webjars/flot/${flotcharts-version}/jquery.flot.time.js"></script>
<script type="text/javascript" src="../../webjars/flot/${flotcharts-version}/jquery.flot.stack.js"></script>
<script type="text/javascript" src="../../3rdparty/flot-plugins/jquery.flot.tooltip.js"></script>
<script type="text/javascript" src="../../3rdparty/flot-plugins/jquery.flot.axislabels.js"></script>

<script type="text/javascript" src="../../3rdparty/checklist-model/checklist-model.js"></script>
<!-- misc -->
<script type="text/javascript" src="../../client/nwc/openLayersExtensions/WaterCensusToolbar/js/WaterCensusToolbar.js"></script>

<!--services -->
<script type="text/javascript" src="../../client/nwc/services/util.js"></script>
<script type="text/javascript" src="../../client/nwc/services/DataSeriesStore.js"></script>
<script type="text/javascript" src="../../client/nwc/services/SosSources.js"></script>
<script type="text/javascript" src="../../client/nwc/services/SosResponseParser.js"></script>
<script type="text/javascript" src="../../client/nwc/services/watchModule.js"></script>
<script type="text/javascript" src="../../client/nwc/services/sharedStateServices.js"></script>
<script type="text/javascript" src="../../client/nwc/services/waterBudgetPlot.js"></script>
<script type="text/javascript" src="../../client/nwc/services/baseMap.js"></script>
<script type="text/javascript" src="../../client/nwc/services/waterBudgetMap.js"></script>
<script type="text/javascript" src="../../client/nwc/services/aquaticBiologyMap.js"></script>
<script type="text/javascript" src="../../client/nwc/services/Conversion.js"></script>
<script type="text/javascript" src="../../client/nwc/services/waterUsageChart.js"></script>
<!-- controllers -->
<script type="text/javascript" src="../../client/nwc/controllers/controllerHelpers.js"></script>
<script type="text/javascript" src="../../client/nwc/controllers/waterBudgetControllers.js"></script>
<script type="text/javascript" src="../../client/nwc/controllers/aquaticBiologyControllers.js"></script>
<!-- main app-->
<script type="text/javascript" src="../../client/nwc/app.js"></script>



<div class="angularRoot"  ng-app="nwcApp">
    <div ui-view></div>
</div>
