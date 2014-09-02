/*******************************************************************************
 * Project:		nwcui
 * Source:		WebConfig.java
 * Author:		Philip Russo
 ******************************************************************************/

package gov.usgs.nwc.springinit;

import java.io.File;
import java.net.URL;
import java.util.HashMap;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.export.Export;
import gov.usgs.cida.proxy.AlternateProxyServlet;
import gov.usgs.nwc.nwcui.utils.WebsiteUtils;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration.Dynamic;

import org.apache.log4j.Logger;
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

public class SpringInitializer implements WebApplicationInitializer {
	private static Logger log = WebsiteUtils.getLogger(SpringInitializer.class);
	
	// gets invoked automatically when application starts up
	public void onStartup(ServletContext servletContext)
			throws ServletException {
        
		// Create ApplicationContext. I'm using the
		// AnnotationConfigWebApplicationContext to avoid using beans xml files.
		AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
		ctx.register(SpringConfig.class);

		// Add the servlet mapping manually and make it initialize automatically
		// 		Need to include the following for class Dynamic
		/*
			<dependency>
				<groupId>javax.servlet</groupId>
				<artifactId>javax.servlet-api</artifactId>
				<version>3.1.0</version>
			</dependency>
		 */
		Dynamic servlet = servletContext.addServlet("dispatcher", new DispatcherServlet(ctx));
		servlet.addMapping("/");
		servlet.setLoadOnStartup(1);
		
        // Add the export (echo) servlet from proxy-utils
        Dynamic exportServlet = servletContext.addServlet("export", new Export());
        exportServlet.addMapping("/export");
        exportServlet.setLoadOnStartup(2);
        
        configureProxies(servletContext);
	}
	
	private void configureProxies(ServletContext servletContext) {
	    DynamicReadOnlyProperties props = null;
		try {
            URL applicationProperties = getClass().getClassLoader().getResource("application.properties");
            File propsFile = new File(applicationProperties.toURI());
            props = new DynamicReadOnlyProperties(propsFile);
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            log.error("Could not set up properties");
        }

	    String geoserverUrl = props.getProperty("nwc.endpoint.geoserver", "http://cida-eros-wsdev.er.usgs.gov:8081/geoserver/");
        Dynamic geoserver = servletContext.addServlet("geoserver", new AlternateProxyServlet());
        geoserver.addMapping("/geoserver/*");
        geoserver.setLoadOnStartup(3);
        HashMap<String,String> geoserverParams = new HashMap<>();
        geoserverParams.put("forward-url-param", "geoserverUrl");
        geoserverParams.put("forward-url", geoserverUrl);
        geoserver.setInitParameters(geoserverParams);
        
	    String threddsUrl = props.getProperty("nwc.endpoint.thredds", "http://cida-eros-wsdev.er.usgs.gov:8081/thredds/sos/watersmart/");
        Dynamic thredds = servletContext.addServlet("thredds", new AlternateProxyServlet());
        thredds.addMapping("/thredds/*");
        thredds.setLoadOnStartup(4);
        HashMap<String,String> threddsParams = new HashMap<>();
        threddsParams.put("forward-url-param", "threddsUrl");
        threddsParams.put("forward-url", threddsUrl);
        thredds.setInitParameters(threddsParams);
        
	    String wpsUrl = props.getProperty("nwc.endpoint.wps", "http://cida-eros-wsdev.er.usgs.gov:8081/wps/");
        Dynamic wps = servletContext.addServlet("wps", new AlternateProxyServlet());
        wps.addMapping("/wps/*");
        wps.setLoadOnStartup(5);
        HashMap<String,String> wpsParams = new HashMap<>();
        wpsParams.put("forward-url-param", "wpsParams");
        wpsParams.put("forward-url", wpsUrl);
        wps.setInitParameters(wpsParams);
        
	    String nwisUrl = props.getProperty("nwc.enpoint.nwis", "http://waterservices.usgs.gov/nwis/site/");
        Dynamic nwis = servletContext.addServlet("nwis", new AlternateProxyServlet());
        nwis.addMapping("/nwis/*");
        nwis.setLoadOnStartup(6);
        HashMap<String,String> nwisParams = new HashMap<>();
        nwisParams.put("forward-url-param", "nwisUrl");
        nwisParams.put("forward-url", nwisUrl);
        nwis.setInitParameters(nwisParams);
	}
}
