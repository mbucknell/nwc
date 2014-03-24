/*******************************************************************************
 * Project:		nwcui
 * Source:		WebConfig.java
 * Author:		Philip Russo
 ******************************************************************************/

package gov.usgs.nwc.springinit;

import java.util.Map;

import javax.sql.DataSource;

import org.apache.commons.dbcp.BasicDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewInterceptor;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
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
@EnableTransactionManagement
@PropertySource("file:${catalina.home}/conf/nwc.site.properties")		// Unfortunately this is Tomcat specific.  For us its ok
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
		 * Our Support Resources
		 */
        final int cachePeriod = Integer.parseInt(env.getProperty("webResourceCachePeriod", "31556926"));
        registry.addResourceHandler("/favicon.ico").addResourceLocations("/img/favicon.ico").setCachePeriod(cachePeriod);
        registry.addResourceHandler("/css/**").addResourceLocations("/css/").setCachePeriod(cachePeriod);
        registry.addResourceHandler("/img/**").addResourceLocations("/img/").setCachePeriod(cachePeriod);
        registry.addResourceHandler("/js/**").addResourceLocations("js/").setCachePeriod(cachePeriod);
        
        /**
         * External Support Resources (Twitter Bootstrap and JQuery)
         */
        registry.addResourceHandler("/bootstrap/**").addResourceLocations("/client/3rdparty/bootstrap/").setCachePeriod(cachePeriod);
        registry.addResourceHandler("/jquery/**").addResourceLocations("/client/3rdparty/jquery/").setCachePeriod(cachePeriod);
        registry.addResourceHandler("/3rdparty/**").addResourceLocations("/client/3rdparty/").setCachePeriod(cachePeriod);

        /**
         * Our Bootstrap themes (I separate them from the above so that I know exactly what is what and where)
         */
        registry.addResourceHandler("/themes/**").addResourceLocations("/themes/").setCachePeriod(cachePeriod);
        
        /**
         * The Client source
         */

        registry.addResourceHandler("/client/**").addResourceLocations("/client/").setCachePeriod(cachePeriod);        
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
	
	
	/**
     * PERSISTENCE
     * ************************************************************************
     */
	/**
	 * Setup the DataSource 
	 * 		We are using Apache DBCP's BasicDataSource which gives us connection
	 * 		pooling by default.  Good explaination of how this works is here:
	 * 		http://stackoverflow.com/questions/14467480/connection-pooling-with-apache-dbcp
	 */
	@Bean
	public DataSource getDataSource() {
		BasicDataSource ds = new BasicDataSource();
		ds.setUrl(env.getProperty("db.url"));
		ds.setDriverClassName(env.getProperty("db.driver"));
		ds.setUsername(env.getProperty("db.user"));
		ds.setPassword(env.getProperty("db.pass"));

		return ds;
	}
	
	/**
	 * Use plain old JPA for Persistence
	 */
	@Bean
	public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
		LocalContainerEntityManagerFactoryBean emf = new LocalContainerEntityManagerFactoryBean();
		emf.setDataSource(getDataSource());
		emf.setPackagesToScan("gov.usgs.nwc.nwcui");

		// let Hibernate know which database we're using.
		// note that this is vendor specific, not JPA
		Map<String, Object> opts = emf.getJpaPropertyMap();
		opts.put("hibernate.dialect", env.getProperty("db.hibernate.dialect"));

		HibernateJpaVendorAdapter va = new HibernateJpaVendorAdapter();
		emf.setJpaVendorAdapter(va);

		return emf;
	}

	@Bean
	public PlatformTransactionManager transactionManager() {
		JpaTransactionManager tm = new JpaTransactionManager(
				entityManagerFactory().getObject());
		
		return tm;
	}

	// Enable accessing entityManager from view scripts. Required when using
	// lazy loading
	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		OpenEntityManagerInViewInterceptor interceptor = new OpenEntityManagerInViewInterceptor();
		interceptor.setEntityManagerFactory(entityManagerFactory().getObject());
		registry.addWebRequestInterceptor(interceptor);
	}
}
