package gov.usgs.cida.nwc.servlet;

import org.junit.Test;
import static org.junit.Assert.*;

public class SkeletonPageServletTest {
	
	public SkeletonPageServletTest() {
	}

	/**
	 * Test of getUrlWithoutContextPath method, of class SkeletonPageServlet.
	 */
	@Test
	public void testGetUrlWithoutContextPath() {
		String fullUrl = "http://cida.usgs.gov/nwc/blah";
		String contextPath = "/nwc";
		SkeletonPageServlet instance = new SkeletonPageServlet();
		String expResult = "/blah";
		String result = instance.getUrlWithoutContextPath(fullUrl, contextPath);
		assertEquals(expResult, result);
	}
	/**
	 * Test of getUrlWithoutContextPath method, of class SkeletonPageServlet.
	 */
	@Test(expected = IllegalArgumentException.class)
	public void shouldThrowExceptionOnEmptyContextPath() {
		String fullUrl = "http://localhost:8080/";
		String contextPath = "";
		SkeletonPageServlet instance = new SkeletonPageServlet();
		instance.getUrlWithoutContextPath(fullUrl, contextPath);
	}
}
