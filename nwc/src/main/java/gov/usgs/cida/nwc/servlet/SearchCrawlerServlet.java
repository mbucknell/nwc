package gov.usgs.cida.nwc.servlet;

import gov.usgs.cida.nwc.conversion.IPrettyUrlToResourceMapper;
import gov.usgs.cida.nwc.util.PrettyUglyUrlMapper;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import gov.usgs.cida.simplehash.SimpleHash;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.URISyntaxException;
import org.apache.commons.io.IOUtils;
import org.apache.http.client.utils.URIBuilder;

public class SearchCrawlerServlet extends HttpServlet{
	public static final String SKELETON_FILE_EXTENSION = "html";
	private final IPrettyUrlToResourceMapper mapper;
	/**
	 * Given a request from a searchbot, serve up a cached page that is
	 * easily interpreted by the searchbot
	 * @param request
	 * @param response
	 * @throws IOException 
	 */
	public SearchCrawlerServlet(IPrettyUrlToResourceMapper mapper){
		this.mapper = mapper;
	}
	@Override
	protected void service(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String uglyUrl = getFullUrl(request);
		String prettyUrl = PrettyUglyUrlMapper.uglyToPretty(uglyUrl);
		String contextPath = request.getContextPath();
		String prettyUrlWithoutContextPath = getUrlWithoutContextPath(prettyUrl, contextPath);
		try {
			String prettyUrlFragment = "#" + new URI(prettyUrlWithoutContextPath).getFragment();
			String prettyUrlFragmentHash = SimpleHash.hash(prettyUrlFragment, "SHA-1");
			String resourceName = "/skeleton/" + prettyUrlFragmentHash + "." + SKELETON_FILE_EXTENSION;
			
			try (
				InputStream skeletonStream = this.getClass().getResourceAsStream(resourceName);
				OutputStream responseStream = response.getOutputStream();
			) {
				if(null == skeletonStream){
					response.sendError(404);
				} else {
					IOUtils.copy(skeletonStream, responseStream);
				}
			}

			
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
	 *	* fragment
	 * @param request
	 * @return 
	 */
	String getUrlWithoutContextPath(String fullUrl, String contextPath){
		URI fullUri;
		String urlWithoutContextPath = null;
		try {
			fullUri = new URI(fullUrl);
			URIBuilder builder = new URIBuilder(fullUri);
			builder.setHost(null)
			.setScheme(null);
			if(null != contextPath && !contextPath.isEmpty()){
				builder.setPath(fullUri.getPath().replaceFirst(".*" + contextPath, ""));
			}
			urlWithoutContextPath = builder.build().toString();
		} catch (URISyntaxException ex) {
			throw new IllegalArgumentException(ex);
		}
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
