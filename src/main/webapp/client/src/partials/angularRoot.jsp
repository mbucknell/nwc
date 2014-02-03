<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%-- 
    Place any dependencies specific to the entire angular app here.
    Step-specific or workflow-specific dependencies can be loaded in the 
    templates for those steps or workflows.
--%>
<!--library dependencies -->
<script type="text/javascript" src="../../webjars/angularjs/1.2.1/angular.js"></script>
<script type="text/javascript" src="../../webjars/angular-ui-router/0.2.0/angular-ui-router.js"></script>
<script type="text/javascript" src="../../webjars/angular-ui-bootstrap/0.9.0/ui-bootstrap.js"></script>
<script type="text/javascript" src="../../webjars/angular-ui-bootstrap/0.9.0/ui-bootstrap-tpls.js"></script>
<script type="text/javascript" src="../../webjars/sugar/1.3.8/sugar-full.development.js"></script>
<script type="text/javascript" src="../../webjars/openlayers/2.13.1/OpenLayers.debug.js"></script>
<script type="text/javascript" src="../../3rdparty/dygraphs/dygraph-dev.js"></script>
<script type="text/javascript" src="../../webjars/flot/0.8.0/jquery.flot.js"></script>
<script type="text/javascript" src="../../webjars/flot/0.8.0/jquery.flot.resize.js"></script>
<script type="text/javascript" src="../../webjars/flot/0.8.0/jquery.flot.time.js"></script>
<script type="text/javascript" src="../../webjars/flot/0.8.0/jquery.flot.stack.js"></script>
<script type="text/javascript" src="../../3rdparty/flot-plugins/jquery.flot.tooltip.js"></script>
<script type="text/javascript" src="../../3rdparty/flot-plugins/jquery.flot.axislabels.js"></script>

<script type="text/javascript" src="../../3rdparty/checklist-model/checklist-model.js"></script>
<!-- misc -->
<script type="text/javascript" src="../../client/src/openLayersExtensions/WaterCensusToolbar/js/WaterCensusToolbar.js"></script>

<!--services -->
<script type="text/javascript" src="../../client/src/services/util.js"></script>
<script type="text/javascript" src="../../client/src/services/DataSeriesStore.js"></script>
<script type="text/javascript" src="../../client/src/services/SosSources.js"></script>
<script type="text/javascript" src="../../client/src/services/SosResponseParser.js"></script>
<script type="text/javascript" src="../../client/src/services/watchModule.js"></script>
<script type="text/javascript" src="../../client/src/services/sharedStateServices.js"></script>
<script type="text/javascript" src="../../client/src/services/waterBudgetPlot.js"></script>
<script type="text/javascript" src="../../client/src/services/baseMap.js"></script>
<script type="text/javascript" src="../../client/src/services/waterBudgetMap.js"></script>
<script type="text/javascript" src="../../client/src/services/aquaticBiologyMap.js"></script>
<script type="text/javascript" src="../../client/src/services/Conversion.js"></script>
<script type="text/javascript" src="../../client/src/services/waterUsageChart.js"></script>
<!-- controllers -->
<script type="text/javascript" src="../../client/src/controllers/controllerHelpers.js"></script>
<script type="text/javascript" src="../../client/src/controllers/waterBudgetControllers.js"></script>
<script type="text/javascript" src="../../client/src/controllers/aquaticBiologyControllers.js"></script>
<!-- main app-->
<script type="text/javascript" src="../../client/src/app.js"></script>



<div class="angularRoot"  ng-app="nwcApp">
    <div ui-view></div>
</div>
