package gov.usgs.cida.nwc.util;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.http.NameValuePair;
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
		List<NameValuePair> prettyParams = new ArrayList<NameValuePair>();
		List<NameValuePair> uglyParams;
		uglyParams = URLEncodedUtils.parse(ugly.toString(), Charset.forName("utf-8"), '&');
		
		return null;
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
