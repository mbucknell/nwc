package gov.usgs.cida.nwc.filters;

import gov.usgs.cida.nwc.servlets.SkeletonPageServlet;
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


public class SearchBotUglyUrlFilter implements Filter{
	private HttpServlet delegateServlet;
	public static final String SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME = "_escaped_fragment_";
	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		setDelegateServlet(new SkeletonPageServlet());
	}

	/**
	 * If the request contains the searchbot escaped fragment parameter, then
	 * bypass the rest of the filter chain and handle request via this instance's 
	 * delegate servlet. If the request does not contain the searchbot parameter, 
	 * then continue through the filter chain as normal.
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
