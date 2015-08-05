<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<%@include file="/jsp/USGSHead.jsp" %>
		<meta name="fragment" content="!">	
		<script type="text/javascript">
			(function(){
				window.CONFIG = {};
				CONFIG.contextPath = "${pageContext.request.contextPath}";
				CONFIG.endpoint = {};
				CONFIG.endpoint.direct = {};

				//point to local proxies
				CONFIG.endpoint.geoserver = CONFIG.contextPath + '/proxygeoserver/';
				CONFIG.endpoint.thredds = CONFIG.contextPath + '/proxythredds/';
				CONFIG.endpoint.wpsBase = CONFIG.contextPath + '/proxywps/';
				CONFIG.endpoint.wps = CONFIG.endpoint.wpsBase + 'WebProcessingService'; //TODO inconsistant use of of URL resources
				CONFIG.endpoint.nwis = '${directNwisEndpoint}';
				CONFIG.endpoint.nwisStreamflow = '${directNwisStreamflowEndpoint}';
				
				CONFIG.endpoint.searchService = '${searchServiceEndpoint}';
				
				CONFIG.endpoint.direct.geoserver = '${directGeoserverEndpoint}';
				CONFIG.endpoint.direct.thredds = '${directThreddsEndpoint}';
				CONFIG.endpoint.direct.wps = '${directWpsEndpoint}';
				CONFIG.endpoint.direct.nwis = '${directNwisEndpoint}';
				CONFIG.endpoint.direct.sciencebase = '${directSciencebaseEndpoint}';

				//This is solely to not break IE, TODO: bring in logging lib
				if(!window.console) {
					window.console = {
						log : function() {},
						dir : function() {},
						error : function() {}
					};
				}
			}());
			$(document).ready(function() {
				$('#ie9-warning-modal').modal();
			});
		</script>
	</head>
	<body>
		<!--[if lt IE 10]>
			<div id="ie9-warning-modal" class="modal fade">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h4 class="modal-title">IE9 and lower not supported</h4>
						</div>
						<div class="modal-body">
							<p>The application has been tested in the latest versions of Chrome, Firefox, and Safari and has been tested on IE10 and IE11.</p>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
		<![endif]-->
		<div class="container-fluid site_body_content">
			<div class="row">
				<div id="site_header" class="col-xs-12">
					<%@include file="/jsp/USGSHeader.jsp" %>
				</div>
			</div>
			<div class="row">
				<div id="site_nav" class="col-xs-12">
					<%@include file="/jsp/nav.jsp" %>
				</div>
			</div>
			<div class="row site_body_content">
				<div id="site_content" class="col-xs-12">
				</div>
			</div>
		</div>
		<div id="site_footer">
			<%@include file="/jsp/USGSFooter.jsp" %>
		</div>
		<!-- vendor libraries -->
		<script type="text/javascript" src="webjars/select2/${select2Version}/select2${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/sugar/${sugarVersion}/sugar.min.js"></script>
		<script type="text/javascript" src="webjars/underscorejs/${underscoreVersion}/underscore.js"></script>
		<script type="text/javascript" src="webjars/backbonejs/${backboneVersion}/backbone.js"></script>
		<script type="text/javascript" src="webjars/handlebars/${handlebarsVersion}/handlebars${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/openlayers/${openlayersVersion}/OpenLayers.js"></script>
		<script type="text/javascript" src="webjars/flot/${flotchartsVersion}/jquery.flot${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/flot/${flotchartsVersion}/jquery.flot.resize${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/flot/${flotchartsVersion}/jquery.flot.time${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/flot/${flotchartsVersion}/jquery.flot.stack${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/jsts/${jstsVersion}/javascript.util.js"></script>
		<script type="text/javascript" src="webjars/jsts/${jstsVersion}/jsts.js"></script>

		<script type="text/javascript" src="webjars/dygraphs/${dygraphsVersion}/dygraph-combined${dygraphsMin}.js"></script> -->
		<script type="text/javascript" src="vendorlibs/flot-plugins/jquery.flot.tooltip.js"></script>
		<script type="text/javascript" src="vendorlibs/flot-plugins/jquery.flot.axislabels.js"></script>
		<script type="text/javascript" src="vendorlibs/FileSaver.js-master/FileSaver.js"></script>
		
		<!-- order is important -->
		<script type="text/javascript" src="gov.usgs.cida.jslibs/openlayers/extension/Raster.js"></script>
		<script type="text/javascript" src="gov.usgs.cida.jslibs/openlayers/extension/Layer/Raster.js"></script>
		<script type="text/javascript" src="gov.usgs.cida.jslibs/openlayers/extension/Raster/Grid.js"></script>	
		<script type="text/javascript" src="gov.usgs.cida.jslibs/openlayers/extension/Raster/Composite.js"></script>
		<script type="text/javascript" src="gov.usgs.cida.jslibs/openlayers/extension/Raster/Operation.js"></script>
		<script type="text/javascript" src="js/utils/openLayersExtensions/FlowlineLayer/FlowlinesData.js"></script>
<!--	<script type="text/javascript" src="js/utils/openLayersExtensions/FlowlineLayer/FlowlinesRaster.js"></script>
-->
		<script type="text/javascript" src="js/utils/templateLoader.js"></script>
		<script type="text/javascript" src="js/utils/jqueryUtils.js"></script>
		<script type="text/javascript" src="js/utils/Conversion.js"></script>
		<script type="text/javascript" src="js/utils/mapUtils.js"></script>
		<script type="text/javascript" src="js/utils/CountyWaterUseProperties.js"></script>
		<script type="text/javascript" src="js/utils/SosSources.js"></script>
		<script type="text/javascript" src="js/utils/SosResponseParser.js"></script>
		<script type="text/javascript" src="js/utils/dataSeriesStore.js"></script>
		<script type="text/javascript" src="js/utils/Plotter.js"></script>
		<script type="text/javascript" src="js/utils/waterUsageChart.js"></script>
		<script type="text/javascript" src="js/utils/WaterYearUtil.js"></script>
		<script type="text/javascript" src="js/utils/dictionaries.js"></script>	
		<script type="text/javascript" src="js/utils/wpsClient.js"></script>
		<script type="text/javascript" src="js/utils/streamStats.js"></script>
		<script type="text/javascript" src="js/utils/RdbParser.js"></script>
		<script type="text/javascript" src="js/utils/hucCountiesIntersector.js"></script>
		<script type="text/javascript" src="js/utils/numberFormat.js"></script>

		<script type="text/javascript" src="js/model/BaseSelectMapModel.js"></script>
		
		<script type="text/javascript" src="js/model/WaterBudgetSelectMapModel.js"></script>
		<script type="text/javascript" src="js/model/StreamflowStatsSelectMapModel.js"></script>
		<script type="text/javascript" src="js/model/AquaticBiologySelectMapModel.js"></script>
		<script type="text/javascript" src="js/model/AquaticBiologyFeaturesModel.js"></script>
		<script type="text/javascript" src="js/model/WaterBudgetHucPlotModel.js"></script>
		<script type="text/javascript" src="js/model/WaterBudgetCountyPlotModel.js"></script>
		
		<script type="text/javascript" src="js/view/BaseView.js"></script>
		<script type="text/javascript" src="js/view/BaseSelectMapView.js"></script>
		<script type="text/javascript" src="js/view/BaseDiscoveryTabView.js"></script>
		
		<script type="text/javascript" src="js/view/HomeView.js"></script>
                
		<script type="text/javascript" src="js/view/AquaticBiologyMapView.js"></script>
		<script type="text/javascript" src="js/view/AquaticBiologySelectFeaturesView.js"></script>
		<script type="text/javascript" src="js/view/BiodataGageMapView.js"></script>
		<script type="text/javascript" src="js/view/AquaticBiologyPairView.js"></script>
		<script type="text/javascript" src="js/view/DataDiscoveryView.js"></script>
		<script type="text/javascript" src="js/view/ProjectTabView.js"></script>
		<script type="text/javascript" src="js/view/ProjectView.js"></script>
		<script type="text/javascript" src="js/view/DataTabView.js"></script>
		<script type="text/javascript" src="js/view/DataView.js"></script>
		<script type="text/javascript" src="js/view/PublicationsTabView.js"></script>
		
		<script type="text/javascript" src="js/view/StreamflowStatsMapView.js"></script>
		<script type="text/javascript" src="js/view/StreamflowPlotView.js"></script>
		<script type="text/javascript" src="js/view/StreamflowStatsGageDataView.js"></script>
		<script type="text/javascript" src="js/view/StreamflowStatsHucDataView.js"></script>
		<script type="text/javascript" src="js/view/StreamflowStatsModeledInfoView.js"></script>
		<script type="text/javascript" src="js/view/StreamflowCalculateStatsView.js"></script>
		<script type="text/javascript" src="js/view/HucCountyMapView.js"></script>
		<script type="text/javascript" src="js/view/CountyWaterUseView.js"></script>
		<script type="text/javascript" src="js/view/HucInsetMapView.js"></script>
		<script type="text/javascript" src="js/view/WaterbudgetPlotView.js"></script>
		<script type="text/javascript" src="js/view/WaterBudgetMapView.js"></script>
		<script type="text/javascript" src="js/view/WaterBudgetHucDataView.js"></script>
		<script type="text/javascript" src="js/controller/NWCRouter.js"></script>
		
		<script type="text/javascript" src="js/init.js"></script>
	</body>
</html>
