package gov.usgs.cida.nwc.conversion;

import gov.usgs.cida.nwc.servlet.SearchCrawlerServlet;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.mockito.Mockito;
import static org.mockito.Mockito.mock;

/**
 *
 * @author cschroed
 */
public class BasePrettyUrlToResourceMapperTest {
	BasePrettyUrlToResourceMapper mockMapper;
	/**
	 * Test of getUrlWithoutContextPath method, of class SkeletonPageServlet.
	 */
	@Before
	public void setup(){
		mockMapper = mock(BasePrettyUrlToResourceMapper.class, Mockito.CALLS_REAL_METHODS);
	}
	@Test
	public void testGetUrlWithoutContextPath() {
		String fullUrl = "http://cida.usgs.gov/nwc/blah";
		String contextPath = "/nwc";
		String expResult = "/blah";
		String result = mockMapper.getUrlWithoutContextPath(fullUrl, contextPath);
		assertEquals(expResult, result);
	}
	/**
	 * Test of getUrlWithoutContextPath method, of class SkeletonPageServlet.
	 */
	@Test
	public void testEmptyContextPath() {
		String fullUrl = "http://localhost:8080/";
		String contextPath = "";
		String result = mockMapper.getUrlWithoutContextPath(fullUrl, contextPath);
		String expected = "/";
		assertEquals(expected, result);
	}
	
}
