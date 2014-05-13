<!DOCTYPE HTML>
<%@include file="/WEB-INF/base.jsp"%>
<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles"%>

<html>
	<head>
		<tiles:insertAttribute name="meta" />
                <script type="text/javascript">
                    (function(){
                        window.CONFIG = {};
                        CONFIG.endpoint = {};
                        CONFIG.endpoint.geoserver = '<%= props.getProperty("nwc.endpoint.geoserver", "http://cida-eros-wsdev.er.usgs.gov:8081/geoserver/")%>';
                        CONFIG.endpoint.thredds = '<%= props.getProperty("nwc.endpoint.thredds", "http://cida-eros-wsdev.er.usgs.gov:8081/thredds/sos/watersmart/")%>';
                        CONFIG.endpoint.wps = '<%= props.getProperty("nwc.endpoint.wps", "http://cida-eros-wsdev.er.usgs.gov:8081/wps")%>';
                        CONFIG.endpoint.nwis = '<%= props.getProperty("nwc.enpoint.nwis", "http://waterservices.usgs.gov/nwis/site/?")%>';
                        
                        // Swap out the protocol for use within javascript
                        CONFIG.endpoint.geoserver = CONFIG.endpoint.geoserver.substr(CONFIG.endpoint.geoserver.indexOf("/"));
                        CONFIG.endpoint.thredds = CONFIG.endpoint.thredds.substr(CONFIG.endpoint.thredds.indexOf("/"));
                        CONFIG.endpoint.wps = CONFIG.endpoint.wps.substr(CONFIG.endpoint.wps.indexOf("/"));
                        CONFIG.endpoint.nwis = CONFIG.endpoint.nwis.substr(CONFIG.endpoint.nwis.indexOf("/"));
                    }());
                </script>
                        
	</head>
	<body>
		<div class="container site_body_content">
			<div class="row">
				<div id="site_header" class="col-xs-12">
					<tiles:insertAttribute name="header" />
				</div>
			</div>
			<div class="row">
				<div id="site_nav" class="col-xs-12">
					<tiles:insertAttribute name="nav" />
				</div>
			</div>
			<div class="row site_body_content">
				<div id="site_content" class="col-xs-12">
					<tiles:insertAttribute name="body" />
				</div>
			</div>
		</div>
		
		<!--	<div id="site_footer" class="navbar-fixed-bottom"> -->
		<div id="site_footer" class="">
			<tiles:insertAttribute name="footer" />
 		</div>
	</body>
</html>
