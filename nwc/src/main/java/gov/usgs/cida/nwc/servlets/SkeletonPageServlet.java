package gov.usgs.cida.nwc.servlets;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import gov.usgs.cida.simplehash.SimpleHash;

public class SkeletonPageServlet extends HttpServlet{

	@Override
	protected void service(HttpServletRequest request, HttpServletResponse response){
		String urlWithoutContextPath = getUrlWithoutContextPath(request);
		
		
	}
	
	/**
	 * Returns the url of the request after the context path. This excludes:
	 *	* protocol
	 *	* host
	 *	* port
	 *	* context path
	 * and includes:
	 *	* non-context path 
	 *	* the query string
	 * @param request
	 * @return 
	 */
	String getUrlWithoutContextPath(HttpServletRequest request){
		String pathWithoutQueryString = request.getRequestURI();
		String queryString = request.getQueryString();
		String contextPath = request.getContextPath();
		String urlWithoutContextPath = pathWithoutQueryString.substring(contextPath.length());
		if(null != queryString){
			urlWithoutContextPath += queryString;
		}
		return null;
	}
}
