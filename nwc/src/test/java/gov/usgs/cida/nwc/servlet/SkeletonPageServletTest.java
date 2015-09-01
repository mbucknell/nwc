package gov.usgs.cida.nwc.servlet;

import gov.usgs.cida.nwc.servlet.SkeletonPageServlet;
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


	
}
