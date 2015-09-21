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
		<div class="container-fluid">
			<div class="row">
				<div id="site_header">
					<%@include file="/jsp/USGSHeader.jsp" %>
				</div>
			</div>
			<div class="row">
				<div id="site_nav">
					<%@include file="/jsp/nav.jsp" %>
				</div>
			</div>
			<div class="row site_body_content">
				<div id="site_content" class="col-xs-12">
				</div>
			</div>
				
			<div id="site_footer">
				<%@include file="/jsp/USGSFooter.jsp" %>
			</div>
		</div>
		
		<!-- vendor libraries -->
		<script type="text/javascript" src="webjars/select2/${select2Version}/select2${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/sugar/${sugarVersion}/sugar.min.js"></script>
		<script type="text/javascript" src="webjars/underscorejs/${underscoreVersion}/underscore.js"></script>
		<script type="text/javascript" src="webjars/backbonejs/${backboneVersion}/backbone.js"></script>
		<script type="text/javascript" src="webjars/handlebars/${handlebarsVersion}/handlebars${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/openlayers/${openlayersVersion}/OpenLayers.js"></script>
		<script type="text/javascript" src="js/utils/openLayersExtensions/OpenLayersIE11Fix<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="webjars/flot/${flotchartsVersion}/jquery.flot${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/flot/${flotchartsVersion}/jquery.flot.resize${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/flot/${flotchartsVersion}/jquery.flot.time${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/flot/${flotchartsVersion}/jquery.flot.stack${jsMin}.js"></script>
		<script type="text/javascript" src="webjars/jsts/${jstsVersion}/javascript.util.js"></script>
		<script type="text/javascript" src="webjars/jsts/${jstsVersion}/jsts.js"></script>

		<script type="text/javascript" src="webjars/dygraphs/${dygraphsVersion}/dygraph-combined${dygraphsMin}.js"></script>
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
		<script type="text/javascript" src="js/utils/templateLoader<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/jqueryUtils<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/Conversion<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/mapUtils<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/SosResponseParser<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/dataSeriesStore<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/Plotter<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/waterUsageChart<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/WaterYearUtil<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/dictionaries<%= resourceSuffix %>.js"></script>	
		<script type="text/javascript" src="js/utils/wpsClient<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/streamStats<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/RdbParser<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/hucCountiesIntersector<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/utils/numberFormat<%= resourceSuffix %>.js"></script>

		<script type="text/javascript" src="js/model/Config<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/model/BaseSelectMapModel<%= resourceSuffix %>.js"></script>
		
		<script type="text/javascript" src="js/model/WaterBudgetSelectMapModel<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/model/StreamflowStatsSelectMapModel<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/model/AquaticBiologySelectMapModel<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/model/AquaticBiologyFeaturesModel<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/model/WaterBudgetHucPlotModel<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/model/WaterBudgetCountyPlotModel<%= resourceSuffix %>.js"></script>
		
		<script type="text/javascript" src="js/view/BaseView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/BaseSelectMapView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/BaseDiscoveryTabView<%= resourceSuffix %>.js"></script>
		
		<script type="text/javascript" src="js/view/HomeView<%= resourceSuffix %>.js"></script>
                
		<script type="text/javascript" src="js/view/AquaticBiologyMapView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/AquaticBiologySelectFeaturesView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/BiodataGageMapView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/AquaticBiologyPairView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/DataDiscoveryView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/ProjectTabView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/ProjectView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/DataTabView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/DataView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/PublicationsTabView<%= resourceSuffix %>.js"></script>
		
		<script type="text/javascript" src="js/view/StreamflowStatsMapView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/StreamflowPlotView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/StreamflowStatsGageDataView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/StreamflowStatsHucDataView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/StreamflowStatsModeledInfoView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/StreamflowCalculateStatsView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/HucCountyMapView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/CountyWaterUseView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/HucInsetMapView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/WaterbudgetPlotView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/WaterBudgetMapView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/view/WaterBudgetHucDataView<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="js/controller/NWCRouter<%= resourceSuffix %>.js"></script>
		
		<script type="text/javascript" src="js/init<%= resourceSuffix %>.js"></script>
	</body>
</html>
