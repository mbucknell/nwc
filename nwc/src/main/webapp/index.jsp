<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<%@include file="/WEB-INF/USGSHead.jsp" %>
		
		<script type="text/javascript">
			(function(){
				window.CONFIG = {};
				CONFIG.endpoint = {};
				CONFIG.endpoint.direct = {};

				//point to local proxies
				CONFIG.endpoint.geoserver = 'proxygeoserver/';
				CONFIG.endpoint.thredds = 'proxythredds/';
				CONFIG.endpoint.wpsBase = 'proxywps/';
				CONFIG.endpoint.wps = CONFIG.endpoint.wpsBase + 'WebProcessingService'; //TODO inconsistant use of of URL resources
				CONFIG.endpoint.nwis = '${context}/proxy/nwis/';
				
				CONFIG.endpoint.direct.geoserver = '${directGeoserverEndpoint}';
				CONFIG.endpoint.direct.thredds = '${directThreddsEndpoint}';
				CONFIG.endpoint.direct.wps = '${directWpsEndpoint}';
				CONFIG.endpoint.direct.nwis = '${directNwisEndpoint}';

				//This is solely to not break IE, TODO: bring in logging lib
				if(!window.console) {
					window.console = {
						log : function() {},
						dir : function() {},
						error : function() {}
					};
				}
			}());
		</script>
	</head>
	<body>
		<div class="container site_body_content">
			<div class="row">
				<div id="site_header" class="col-xs-12">
					<%@include file="/WEB-INF/USGSHeader.jsp" %>
				</div>
			</div>
			<div class="row">
				<div id="site_nav" class="col-xs-12">
					<%@include file="/WEB-INF/nav.jsp" %>
				</div>
			</div>
			<div class="row site_body_content">
				<div id="site_content" class="col-xs-12">
				</div>
			</div>
		</div>
		<div id="site_footer">
			<%@include file="/WEB-INF/USGSFooter.jsp" %>
		</div>
		<!-- vendor libraries -->
		<script type="text/javascript" src="webjars/sugar/${sugarVersion}/sugar.min.js"></script>
		<script type="text/javascript" src="webjars/underscorejs/${underscoreVersion}/underscore.js"></script>
		<script type="text/javascript" src="webjars/backbonejs/${backboneVersion}/backbone.js"></script>
		<script type="text/javascript" src="webjars/handlebars/${handlebarsVersion}/handlebars${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/openlayers/${openlayersVersion}/OpenLayers.js"></script>
		<script type="text/javascript" src="webjars/flot/${flotchartsVersion}/jquery.flot${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/jsts/${jstsVersion}/javascript.util.js"></script>
		<script type="text/javascript" src="webjars/jsts/${jstsVersion}/jsts.js"></script>
		
		<!-- order is important -->
		<script type="text/javascript" src="gov.usgs.cida.jslibs/openlayers/extension/Raster.js"></script>
		<script type="text/javascript" src="gov.usgs.cida.jslibs/openlayers/extension/Layer/Raster.js"></script>
		<script type="text/javascript" src="gov.usgs.cida.jslibs/openlayers/extension/Raster/Grid.js"></script>
		<script type="text/javascript" src="gov.usgs.cida.jslibs/openlayers/extension/Raster/Operation.js"></script>
		<script type="text/javascript" src="gov.usgs.cida.jslibs/openlayers/extension/Raster/Composite.js"></script>
				<script type="text/javascript" src="js/utils/openLayersExtensions/FlowlineLayer/FlowlinesData.js"></script>
<!--	<script type="text/javascript" src="js/utils/openLayersExtensions/FlowlineLayer/FlowlinesRaster.js"></script>
-->
		<script type="text/javascript" src="js/utils/templateLoader.js"></script>
		<script type="text/javascript" src="js/utils/Conversion.js"></script>
		<script type="text/javascript" src="js/utils/mapUtils.js"></script>
		<script type="text/javascript" src="js/utils/SosSources.js"></script>
		<script type="text/javascript" src="js/utils/SosResponseParser.js"></script>
		<script type="text/javascript" src="js/utils/dataSeriesStore.js"></script>
		
		<script type="text/javascript" src="js/model/BaseSelectMapModel.js"></script>
		
		<script type="text/javascript" src="js/model/WaterBudgetSelectMapModel.js"></script>
		<script type="text/javascript" src="js/model/StreamflowStatsSelectMapModel.js"></script>
		
		<script type="text/javascript" src="js/view/BaseView.js"></script>
		<script type="text/javascript" src="js/view/BaseSelectMapView.js"></script>
		
		<script type="text/javascript" src="js/view/HomeView.js"></script>
		<script type="text/javascript" src="js/view/AquaticBiologyMapView.js"></script>
		<script type="text/javascript" src="js/view/DataDiscoveryView.js"></script>
		<script type="text/javascript" src="js/view/StreamflowStatsMapView.js"></script>
		<script type="text/javascript" src="js/view/WaterBudgetMapView.js"></script>
		<script type="text/javascript" src="js/view/WaterBudgetHucDataView.js"></script>
		<script type="text/javascript" src="js/controller/NWCRouter.js"></script>
		
		<script type="text/javascript" src="js/init.js"></script>
	</body>
</html>