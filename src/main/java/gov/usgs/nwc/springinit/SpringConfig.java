/*******************************************************************************
 * Project:		nwcui
 * Source:		WebConfig.java
 * Author:		Philip Russo
 ******************************************************************************/

package gov.usgs.nwc.springinit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.tiles3.TilesConfigurer;
import org.springframework.web.servlet.view.tiles3.TilesView;
import org.springframework.web.servlet.view.tiles3.TilesViewResolver;

/**
 * This class takes the place of the old Spring servlet.xml configuration that
 * used to reside in /WEB-INF. 
 */

@Configuration
@ComponentScan(basePackages="gov.usgs.nwc.nwcui")
@EnableWebMvc
public class SpringConfig extends WebMvcConfigurerAdapter {
	
	@Autowired
	Environment env;
	
	@Bean
    public TilesViewResolver getTilesViewResolver() {
        TilesViewResolver tilesViewResolver = new TilesViewResolver();
        
        tilesViewResolver.setViewClass(TilesView.class);
        
        return tilesViewResolver;
    }
	
	@Bean
    public TilesConfigurer getTilesConfigurer() {
        TilesConfigurer tilesConfigurer = new TilesConfigurer();
        tilesConfigurer.setCheckRefresh(true);
        tilesConfigurer.setDefinitions(new String[] { "/WEB-INF/tiles.xml" });
        return tilesConfigurer;
    }
	
	@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
		/**
		 * Our resources
		 */
		registry.addResourceHandler("/favicon.ico").addResourceLocations("/WEB-INF/includes/img/favicon.ico").setCachePeriod(31556926);
        registry.addResourceHandler("/css/**").addResourceLocations("/WEB-INF/includes/css/").setCachePeriod(31556926);
        registry.addResourceHandler("/img/**").addResourceLocations("/WEB-INF/includes/img/").setCachePeriod(31556926);
        registry.addResourceHandler("/js/**").addResourceLocations("/WEB-INF/includes/js/").setCachePeriod(31556926);
        
        /**
         * External Resources (Twitter Bootstrap and JQuery)
         */
        registry.addResourceHandler("/bootstrap/**").addResourceLocations("/WEB-INF/includes/3rdparty/bootstrap/").setCachePeriod(31556926);
        registry.addResourceHandler("/jquery/**").addResourceLocations("/WEB-INF/includes/3rdparty/jquery/").setCachePeriod(31556926);
        
        /**
         * Our theme's (I separate them from the above so that I know exactly what is what and where)
         */
        registry.addResourceHandler("/themes/**").addResourceLocations("/WEB-INF/includes/themes/").setCachePeriod(31556926);
    }
	
	/**
	 * The caveat of mapping DispatcherServlet to "/" is that by default it breaks the ability to serve
	 * static resources like images and CSS files. To remedy this, I need to configure Spring MVC to
	 * enable defaultServletHandling.
	 * 
	 * 		equivalent for <mvc:default-servlet-handler/> tag
	 * 
	 * To do that, my WebappConfig needs to extend WebMvcConfigurerAdapter and override the following method:
	 */
	@Override
	public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
		configurer.enable();
	}
}
