
<%@page import="java.io.File"%>
<%@page import="java.net.URL"%>
<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>

<%!    
    private static final Logger log = LoggerFactory.getLogger("index.jsp");
    protected DynamicReadOnlyProperties props = null;

    {
        try {
            URL applicationProperties = getClass().getClassLoader().getResource("application.properties");
            File propsFile = new File(applicationProperties.toURI());
            props = new DynamicReadOnlyProperties(propsFile);
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            log.error("Could not set up properties");
        }
    }

%>
<%
    boolean development = Boolean.parseBoolean(props.getProperty("nwc.development"));
    request.setAttribute("development", development);
    request.setAttribute("jsMin", (development) ? "" : ".min");
    request.setAttribute("sugarMin", (development) ? ".development" : ".min");
    request.setAttribute("openlayersMin", (development) ? ".debug" : "");
    request.setAttribute("dygraphsMin", (development) ? "-dev" : "-combined");
    

    request.setAttribute("applicationVersion", props.get("version"));
    request.setAttribute("jqueryVersion", props.get("jquery.version"));
    request.setAttribute("bootstrapVersion", props.get("bootstrap.version"));
	request.setAttribute("select2Version", props.get("select2.version"));
	request.setAttribute("backboneVersion", props.get("backbone.version"));
	request.setAttribute("underscoreVersion", props.get("underscore.version"));
	request.setAttribute("handlebarsVersion", props.get("handlebars.version"));
    
    request.setAttribute("flotchartsVersion", props.get("flotcharts.version"));
    request.setAttribute("openlayersVersion", props.get("openlayers.version"));
    request.setAttribute("fontawesomeVersion", props.get("fontawesome.version"));
    request.setAttribute("sugarVersion", props.get("sugar.version"));
    request.setAttribute("jstsVersion", props.get("jsts.version"));

    request.setAttribute("directGeoserverEndpoint", props.get("nwc.endpoint.geoserver"));
    request.setAttribute("directThreddsEndpoint", props.get("nwc.endpoint.thredds"));
    request.setAttribute("directWpsEndpoint", props.get("nwc.endpoint.wps"));
    request.setAttribute("directNwisEndpoint", props.get("nwc.endpoint.nwis"));
%>

<%
	/*
	 For future reference, use the session env variable to retrieve any      
	 application properties located in:                                      
	           ${catalina.home}/conf/nwc.site.properties                     
	                                                                         
	 In order for this to work, the env variable must be placed in the       
	 session by the controller:                                              
	           @Autowired                                                    
	           Environment env;                                              
	                                                                         
	           public ModelAndView someControllerMethod() {                  
	               ModelAndView mv = new ModelAndView("/route");             
	               mv.addObject("env", env);                                 
	               return mv;                                                
	           }                                                             
	                                                                         
	 JSP Example Usage:                                                      
	           <c:set var="dbURL" value="${env.getProperty("db.url")}" />
      */
%>
