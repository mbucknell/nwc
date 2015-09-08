package gov.usgs.cida.nwc.filter;

import gov.usgs.cida.nwc.conversion.IPrettyUrlToResourceMapper;
import gov.usgs.cida.nwc.servlet.SearchCrawlerServlet;
import gov.usgs.cida.nwc.util.PrettyUglyUrlMapper;
import java.io.IOException;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServlet;


public class SearchCrawlerUglyUrlFilter implements Filter{
	private HttpServlet delegateServlet;
	
	//http GET parameter
	public static final String SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME = PrettyUglyUrlMapper.SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME;
	
	//filter config parameter definied in web.xml
	public static final String PRETTY_URL_TO_RESOURCE_MAPPER_PARAM_NAME = "pretty-url-to-resource-mapper";
	
	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		String prettyUrlToResourceMapper = filterConfig.getInitParameter(PRETTY_URL_TO_RESOURCE_MAPPER_PARAM_NAME);
		if(null == prettyUrlToResourceMapper || prettyUrlToResourceMapper.isEmpty()){
			throw new IllegalArgumentException(
				"an init config value must be specified for the '" +
				PRETTY_URL_TO_RESOURCE_MAPPER_PARAM_NAME +"' " +
				"parameter of the '" + this.getClass().getSimpleName() +
				"' filter."
			);
		} else{
			prettyUrlToResourceMapper = prettyUrlToResourceMapper.trim();
			try {
				Class<?> clazz = Class.forName(prettyUrlToResourceMapper);
				IPrettyUrlToResourceMapper instance = (IPrettyUrlToResourceMapper) clazz.newInstance();
				SearchCrawlerServlet searchCrawlerServlet = new SearchCrawlerServlet(instance);
				setDelegateServlet(searchCrawlerServlet);
			} catch (ClassNotFoundException ex){
				throw new IllegalArgumentException(
					"Could not find class '" + 
					prettyUrlToResourceMapper + "' "+
					", the init config value specified for the '" +
					PRETTY_URL_TO_RESOURCE_MAPPER_PARAM_NAME +"' " +
					"parameter of the '" + this.getClass().getSimpleName() +
					"' filter."
				);
			}
			catch (InstantiationException | IllegalAccessException ex) {
				throw new RuntimeException(ex);
			}
		}
		
	}

	/**
	 * If the request contains the searchbot escaped fragment parameter, then
	 * handle the request via this instance's delegate servlet and continue
	 * down the filter chain. If the request does not contain the 
	 * searchbot parameter, then continue through the filter chain.
	 * The detection of the searchbot escaped fragment parameter is
	 * case-insensitive
	 * @param request
	 * @param response
	 * @param chain
	 * @throws IOException
	 * @throws ServletException 
	 */
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		Enumeration<String> paramNames = request.getParameterNames();
		Set<String> lowerCaseParamNames = new HashSet<>();

		if(null != paramNames){
			while(paramNames.hasMoreElements()){
				lowerCaseParamNames.add(paramNames.nextElement().toLowerCase(Locale.ENGLISH));
			}
		}
		
		if(lowerCaseParamNames.contains(SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME)){
			//bypass any other defined filters, delegate to the servlet
			getDelegateServlet().service(request, response);
		} else {
			chain.doFilter(request, response);
		}
	}

	@Override
	public void destroy() {
		
	}

	/**
	 * @return the delegateServlet
	 */
	public HttpServlet getDelegateServlet() {
		return delegateServlet;
	}

	/**
	 * @param delegateServlet the delegateServlet to set
	 */
	public void setDelegateServlet(HttpServlet delegateServlet) {
		this.delegateServlet = delegateServlet;
	}

}
