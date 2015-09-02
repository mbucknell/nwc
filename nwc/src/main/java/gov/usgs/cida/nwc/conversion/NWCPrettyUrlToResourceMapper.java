package gov.usgs.cida.nwc.conversion;

import gov.usgs.cida.simplehash.SimpleHash;
import java.net.URI;
import java.net.URISyntaxException;
import javax.servlet.http.HttpServletRequest;

public class NWCPrettyUrlToResourceMapper extends BasePrettyUrlToResourceMapper {
	
	public static final String SKELETON_FILE_EXTENSION = "html";
	
	@Override
	public String map(String prettyUrl, HttpServletRequest request) {
		String resourceName = null;
		String contextPath = request.getContextPath();
		String prettyUrlWithoutContextPath = getUrlWithoutContextPath(prettyUrl, contextPath);
		try {
			String prettyUrlFragment = "#" + new URI(prettyUrlWithoutContextPath).getFragment();

			String prettyUrlFragmentHash = SimpleHash.hash(prettyUrlFragment, "SHA-1");
			resourceName = "/skeleton/" + prettyUrlFragmentHash + "." + SKELETON_FILE_EXTENSION;
		} catch (URISyntaxException ex) {
			throw new IllegalArgumentException(ex);
		}
		return resourceName;
	}

}
