package gov.usgs.cida.nwc.util;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.util.List;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.client.utils.URLEncodedUtils;

/**
 * This class performs bidirectional mapping between ugly and pretty urls as
 * specified in the Google specification for Making AJAX Applications Crawlable:
 * https://developers.google.com/webmasters/ajax-crawling/docs/specification?hl=en
 * 
 */
public class PrettyUglyUrlMapper {
	static final String SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME = "_escaped_fragment_";
	public static String uglyToPretty(String ugly){
		try {
			String result = null;
			URI uri = uglyToPretty(new URI(ugly));
			if(null != uri){
				result = uri.toString();
			}
			return result;
		} catch (URISyntaxException ex) {
			throw new IllegalArgumentException(ex);
		}
	}
	public static URI uglyToPretty(URI ugly){
		String uglyQuery = ugly.getRawQuery();
		List<NameValuePair> uglyParams = URLEncodedUtils.parse(uglyQuery, Charset.forName("utf-8"), '&');
		URIBuilder uriBuilder = new URIBuilder(ugly);
		
		//rebuild the query using the rules from Google's Spec.
		uriBuilder.removeQuery();
		for(NameValuePair uglyParamPair : uglyParams){
			String lowerCaseParamName = uglyParamPair.getName().toLowerCase(Locale.ENGLISH);
			if(SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME.equals(lowerCaseParamName)){
				String fragmentValue = uglyParamPair.getValue();
				if(!fragmentValue.isEmpty()){
					uriBuilder.setFragment("!" + uglyParamPair.getValue());
				}
			} else {
				uriBuilder.addParameter(uglyParamPair.getName(), uglyParamPair.getValue());
			}
		}
		
		URI builtUri;
		try {
			builtUri = uriBuilder.build();
		} catch (URISyntaxException ex) {
			throw new IllegalArgumentException(ex);
		}
		
		return builtUri;
	}
	
	public static String prettyToUgly(String pretty){
		try {
			String result = null;
			URI uri = prettyToUgly(new URI(pretty));
			if(null != uri){
				result = uri.toString();
			}
			return result;
		} catch (URISyntaxException ex) {
			throw new IllegalArgumentException(ex);
		}
	}
	public static URI prettyToUgly(URI pretty){
		return null;
	}
		
}
