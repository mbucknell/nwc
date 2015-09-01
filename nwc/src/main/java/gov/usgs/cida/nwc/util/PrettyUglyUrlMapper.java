package gov.usgs.cida.nwc.util;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.util.List;
import java.util.Locale;
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
	public static final String BANG = "!";
	
	/**
	 * Convenience wrapper for converting string urls
	 * @param ugly
	 * @return pretty url
	 */
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
	/**
	 * Maps ugly urls to pretty urls as specified in the Google 
	 * specification for Making AJAX Applications Crawlable:
	 * https://developers.google.com/webmasters/ajax-crawling/docs/specification?hl=en
	 * @param ugly
	 * @return pretty url
	 */
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
					uriBuilder.setFragment(BANG + uglyParamPair.getValue());
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
	/**
	 * Convenience wrapper for converting string urls
	 * @param pretty
	 * @return ugly url
	 */
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
	
	/**
	 * Maps pretty urls to ugly urls as specified in the Google 
	 * specification for Making AJAX Applications Crawlable:
	 * https://developers.google.com/webmasters/ajax-crawling/docs/specification?hl=en
	 * @param ugly
	 * @return pretty url
	 */
	public static URI prettyToUgly(URI pretty) {
		URI ugly = null;
		URIBuilder uriBuilder = new URIBuilder(pretty);
		String fragment = pretty.getFragment();
		if (null != fragment && !fragment.isEmpty()) {
			if (fragment.startsWith(BANG)) {
				//move the content of the escaped fragment param
				//to the fragment. Exclude the initial "!"
				uriBuilder.addParameter(SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME, fragment.substring(1));
				uriBuilder.setFragment(null);
			} else {
				throw new IllegalArgumentException(
					"the fragment of a pretty url must begin with a'!'. Got '"
					+ fragment + "' instead."
				);
			}
		}
		try {
			ugly = uriBuilder.build();

		} catch (URISyntaxException ex) {
			throw new IllegalArgumentException(ex);
		}
		return ugly;
	}
}
