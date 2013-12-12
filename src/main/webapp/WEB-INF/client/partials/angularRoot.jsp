<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%-- 
    Place any dependencies specific to the entire angular app here.
    Step-specific or workflow-specific dependencies can be loaded in the 
    templates for those steps or workflows.
--%>

<script type="text/javascript" src="../../webjars/angularjs/1.2.1/angular.js"></script>
<script type="text/javascript" src="../../webjars/angular-ui-router/0.2.0/angular-ui-router.js"></script>
<script type="text/javascript" src="../../webjars/angular-ui-bootstrap/0.6.0/ui-bootstrap.js"></script>
<script type="text/javascript" src="../../webjars/angular-ui-bootstrap/0.6.0/ui-bootstrap-tpls.js"></script>
<script type="text/javascript" src="../../webjars/sugar/1.3.8/sugar-full.development.js"></script>
<script type="text/javascript" src="../../webjars/openlayers/2.13.1/OpenLayers.debug.js"></script>
<script type="text/javascript" src="../../client/js/services/util.js"></script>
<script type="text/javascript" src="../../client/js/services/DataSeriesStore.js"></script>
<script type="text/javascript" src="../../client/js/services/SosSources.js"></script>
<script type="text/javascript" src="../../client/js/services/watchModule.js"></script>
<script type="text/javascript" src="../../client/js/services/sharedStateServices.js"></script>
<script type="text/javascript" src="../../client/js/controllers/stateDemoControllers.js"></script>
<script type="text/javascript" src="../../client/js/app.js"></script>
<script type="text/javascript" src="../../3rdparty/azimuthjs/src/module.js"></script>
<script type="text/javascript" src="../../3rdparty/azimuthjs/src/directives/Layer.js"></script>
<script type="text/javascript" src="../../3rdparty/azimuthjs/src/directives/LayerSource.js"></script>
<script type="text/javascript" src="../../3rdparty/azimuthjs/src/directives/olMap.js"></script>
<script type="text/javascript" src="../../3rdparty/azimuthjs/src/services/component/layers.js"></script>
<script type="text/javascript" src="../../3rdparty/azimuthjs/src/services/component/map.js"></script>


<div class="angularRoot"  ng-app="nwcApp">
    <div ui-view></div>
</div>
