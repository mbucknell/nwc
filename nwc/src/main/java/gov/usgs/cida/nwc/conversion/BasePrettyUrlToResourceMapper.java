package gov.usgs.cida.nwc.conversion;

import java.net.URI;
import java.net.URISyntaxException;
import org.apache.http.client.utils.URIBuilder;


public abstract class BasePrettyUrlToResourceMapper implements IPrettyUrlToResourceMapper{
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
}
