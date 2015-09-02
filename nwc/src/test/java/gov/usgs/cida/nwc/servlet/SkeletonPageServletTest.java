package gov.usgs.cida.nwc.servlet;

import gov.usgs.cida.nwc.conversion.IPrettyUrlToResourceMapper;
import javax.servlet.http.HttpServletRequest;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.Before;
import static org.mockito.Mockito.mock;

public class SkeletonPageServletTest {
	IPrettyUrlToResourceMapper mockMapper;
	/**
	 * Test of getUrlWithoutContextPath method, of class SkeletonPageServlet.
	 */
	public class MockMapper implements IPrettyUrlToResourceMapper {
		@Override
		public String convert(String prettyUrl, HttpServletRequest request) {
			return null;
		}
	}
	
	@Before
	public void setup(){
		mockMapper = mock(IPrettyUrlToResourceMapper.class);
	}
	@Test
	public void testGetUrlWithoutContextPath() {
		String fullUrl = "http://cida.usgs.gov/nwc/blah";
		String contextPath = "/nwc";
		
		SearchCrawlerServlet instance = new SearchCrawlerServlet(mockMapper);
		String expResult = "/blah";
		String result = instance.getUrlWithoutContextPath(fullUrl, contextPath);
		assertEquals(expResult, result);
	}
	/**
	 * Test of getUrlWithoutContextPath method, of class SkeletonPageServlet.
	 */
	@Test
	public void testEmptyContextPath() {
		String fullUrl = "http://localhost:8080/";
		String contextPath = "";
		SearchCrawlerServlet instance = new SearchCrawlerServlet(mockMapper);
		String result = instance.getUrlWithoutContextPath(fullUrl, contextPath);
		String expected = "/";
		assertEquals(expected, result);
	}
}
