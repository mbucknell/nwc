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
	 * @return 
	 */
	public String convert(String prettyUrl, HttpServletRequest request);
}
