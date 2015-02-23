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
				CONFIG.endpoint.geoserver = '${context}/proxy/geoserver/';
				CONFIG.endpoint.thredds = '${context}/proxy/thredds/';
				CONFIG.endpoint.wpsBase = '${context}/proxy/wps/';
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
					CONTENT
				</div>
			</div>
		</div>
		<div id="site_footer">
			<%@include file="/WEB-INF/USGSFooter.jsp" %>
		</div>
		
		<script type="text/javascript" src="webjars/sugar/${sugarVersion}/sugar.min.js"></script>
		<script type="text/javascript" src="webjars/underscorejs/${underscoreVersion}/underscore.js"></script>
		<script type="text/javascript" src="webjars/backbonejs/${backboneVersion}/backbone.js"></script>
		<script type="text/javascript" src="webjars/handlebars/${handlebarsVersion}/handlebars${jsMin}.js"></script>

		<script type="text/javascript" src="js/utils/templateLoader.js"></script>
		<script type="text/javascript" src="js/view/BaseView.js"></script>
		<script type="text/javascript" src="js/view/HomeView.js"></script>
		<script type="text/javascript" src="js/controller/NWCRouter.js"></script>
		
		<script type="text/javascript" src="js/init.js"></script>
	</body>
</html>