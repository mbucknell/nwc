package gov.usgs.cida.nwc.servlet;

import gov.usgs.cida.nwc.conversion.IPrettyUrlToResourceMapper;
import gov.usgs.cida.nwc.util.PrettyUglyUrlMapper;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import org.apache.commons.io.IOUtils;

public class SearchCrawlerServlet extends HttpServlet{
	private final IPrettyUrlToResourceMapper mapper;
	public static final String TEXT_HTML_CONTENT_TYPE = "text/html";
	public static final int NOT_FOUND = 404;

	/**
	 * Instantiate an instance of this class with the specified mapper.
	 * @param mapper - a project-specific instance that is aware of the
	 * project's convention for the resource location of the skeleton pages.
	 */
	public SearchCrawlerServlet(IPrettyUrlToResourceMapper mapper){
		this.mapper = mapper;
	}
	
	/**
	 * Given a request from a searchbot, serve up a cached page that is
	 * easily interpreted by the searchbot
	 * @param request
	 * @param response
	 * @throws IOException 
	 */
	@Override
	protected void service(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String uglyUrl = getFullUrl(request);
		String prettyUrl = PrettyUglyUrlMapper.uglyToPretty(uglyUrl);
		String resourceName = mapper.map(prettyUrl, request);
		response.setContentType(TEXT_HTML_CONTENT_TYPE);
		try (
			InputStream skeletonStream = this.getClass().getResourceAsStream(resourceName);
			OutputStream responseStream = response.getOutputStream();
		) {
			if(null == skeletonStream){
				response.sendError(NOT_FOUND);
			} else {
				IOUtils.copy(skeletonStream, responseStream);
			}
		}


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
