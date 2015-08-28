package gov.usgs.cida.nwc.filters;

import gov.usgs.cida.nwc.servlets.SkeletonPageServlet;
import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServlet;


public class SearchBotUglyUrlFilter implements Filter{
	private HttpServlet delegateServlet;
	static final String SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME = "_escaped_fragment_";
	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		setDelegateServlet(new SkeletonPageServlet());
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		String escapedFragmentGETparam = request.getParameter(SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME);
		if(null == escapedFragmentGETparam){
			chain.doFilter(request, response);
		} else {
			//bypass any other defined filters, delegate to the servlet
			getDelegateServlet().service(request, response);
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
