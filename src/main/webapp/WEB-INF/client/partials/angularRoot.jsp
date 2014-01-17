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
<script type="text/javascript" src="../../webjars/flot/0.8.0/jquery.flot.stack.js"></script>

<!-- misc -->
<script type="text/javascript" src="../../client/js/openLayersExtensions/WaterCensusToolbar/js/WaterCensusToolbar.js"></script>

<!--services -->
<script type="text/javascript" src="../../client/js/services/util.js"></script>
<script type="text/javascript" src="../../client/js/services/DataSeriesStore.js"></script>
<script type="text/javascript" src="../../client/js/services/SosSources.js"></script>
<script type="text/javascript" src="../../client/js/services/SosResponseParser.js"></script>
<script type="text/javascript" src="../../client/js/services/watchModule.js"></script>
<script type="text/javascript" src="../../client/js/services/sharedStateServices.js"></script>
<script type="text/javascript" src="../../client/js/services/waterBudgetPlot.js"></script>
<script type="text/javascript" src="../../client/js/services/baseMap.js"></script>
<script type="text/javascript" src="../../client/js/services/waterBudgetMap.js"></script>
<script type="text/javascript" src="../../client/js/services/aquaticBiologyMap.js"></script>
<script type="text/javascript" src="../../client/js/services/Conversion.js"></script>
<!-- controllers -->
<script type="text/javascript" src="../../client/js/controllers/controllerHelpers.js"></script>
<script type="text/javascript" src="../../client/js/controllers/waterBudgetControllers.js"></script>
<script type="text/javascript" src="../../client/js/controllers/aquaticBiologyControllers.js"></script>
<!-- main app-->
<script type="text/javascript" src="../../client/js/app.js"></script>



<div class="angularRoot"  ng-app="nwcApp">
    <div ui-view></div>
</div>
