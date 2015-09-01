package gov.usgs.cida.nwc.servlet;

import gov.usgs.cida.nwc.util.PrettyUglyUrlMapper;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import gov.usgs.cida.simplehash.SimpleHash;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class SkeletonPageServlet extends HttpServlet{

	@Override
	protected void service(HttpServletRequest request, HttpServletResponse response) throws IOException{
		String uglyUrl = getFullUrl(request);
		String prettyUrl = PrettyUglyUrlMapper.uglyToPretty(uglyUrl);
		String contextPath = request.getContextPath();
		String prettyUrlWithoutContextPath = getUrlWithoutContextPath(prettyUrl, contextPath);
		try {
			String prettyUrlFragment = "#" + new URI(prettyUrlWithoutContextPath).getFragment();
			response.getWriter().append(prettyUrlFragment);
			response.getWriter().flush();
		} catch (URISyntaxException ex) {
			throw new IllegalArgumentException(ex);
		}
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
	String getUrlWithoutContextPath(String fullUrl, String contextPath){
		String urlWithoutContextPath = fullUrl.replaceFirst(".*" + contextPath, "");
		return urlWithoutContextPath;
	}
	/**
	 * Get an HttpServletRequest's full url, including query string
	 * Inspired by: http://stackoverflow.com/a/2222268
	 * @param request
	 * @return full Url
	 */
	public static String getFullUrl(HttpServletRequest request) {
		StringBuffer requestURL = request.getRequestURL();
		String queryString = request.getQueryString();

		if (queryString == null) {
			return requestURL.toString();
		} else {
			return requestURL.append('?').append(queryString).toString();
		}
	}
}
