package gov.usgs.cida.nwc.conversion;

import javax.servlet.http.HttpServletRequest;

public interface IPrettyUrlToResourceMapper {
	/**
	 * 
	 * @param prettyUrl the hashbang-style pretty url as defined by the 
	 * the Google specification for Making AJAX Applications Crawlable:
	 * https://developers.google.com/webmasters/ajax-crawling/docs/specification?hl=en
	 * 
	 * @param request the original request from the searchbot. The original 
	 * request can be used to get the context path, or other relevant 
	 * information needed to perform the conversion.
	 * @return the String name used to locate the skeleton page resource 
	 * on the classpath (most likely the path within the war/jar/ear).
	 * @link java.lang.Class#getResourceAsStream()
	 */
	public String map(String prettyUrl, HttpServletRequest request);
}
