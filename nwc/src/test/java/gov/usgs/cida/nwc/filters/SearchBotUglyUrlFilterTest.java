/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.nwc.filters;

import static org.mockito.Mockito.*;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Locale;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author cschroed
 */
public class SearchBotUglyUrlFilterTest {
	SearchBotUglyUrlFilter filter;
	MockHttpServlet mockServlet;
	MockFilterChain filterChain;
	HttpServletRequest req;
	HttpServletResponse res;
	
	public SearchBotUglyUrlFilterTest() {
	}
	
	class MockFilterChain implements FilterChain {
		public boolean wasCalled = false;
		@Override
		public void doFilter(ServletRequest request, ServletResponse response) throws IOException, ServletException {
			wasCalled = true;
		}
	}
	
	class MockHttpServlet extends HttpServlet{
		public boolean wasCalled = false;
		@Override
		protected void service(HttpServletRequest request, HttpServletResponse response){
			wasCalled = true;
		}
	}

	public void assertFilterChainWasBypassed(){
		assertFalse("filter chain was not called", filterChain.wasCalled);
		assertTrue("delegate servlet was called", mockServlet.wasCalled);
	}
	
	public void assertFilterChainWasCalled(){
		assertTrue("filter chain was called", filterChain.wasCalled);
		assertFalse("delegate servlet was not called", mockServlet.wasCalled);
	}
	
	@Before
	public void setUp() {
		filter = new SearchBotUglyUrlFilter();
		mockServlet = new MockHttpServlet();
		filter.setDelegateServlet(mockServlet);
		filterChain = new MockFilterChain();
		req = mock(HttpServletRequest.class);
		res = mock(HttpServletResponse.class);
	
	}
	
	private static Enumeration<String> enumOf(String... strings){
		return Collections.enumeration(Arrays.asList(strings));
	}
	
	@After
	public void tearDown() {
	}

	/**
	 * Test of doFilter method, of class SearchBotUglyUrlFilter.
	 */
	@Test
	public void assertRequestWithoutParamsHitsFilterChain() throws Exception {
		filter.doFilter(req, res, filterChain);
		assertFilterChainWasCalled();
	}
	
	/**
	 * Test of doFilter method, of class SearchBotUglyUrlFilter.
	 */
	@Test
	public void assertRequestWithIrrelevantParamsHitsFilterChain() throws Exception {
		String irrelevantParamName = "somethingIrrelevant" + SearchBotUglyUrlFilter.SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME;
		when(req.getParameterNames()).thenReturn(enumOf(irrelevantParamName));
		filter.doFilter(req, res, filterChain);
		assertFilterChainWasCalled();
	}

	/**
	 * Test of doFilter method, of class SearchBotUglyUrlFilter.
	 */
	@Test
	public void assertRequestWithTheLowerCaseParamBypassesFilterChain() throws Exception {
		when(req.getParameterNames()).thenReturn(enumOf(SearchBotUglyUrlFilter.SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME));
		filter.doFilter(req, res, filterChain);
		assertFilterChainWasBypassed();
	}
	
	/**
	 * Test of doFilter method, of class SearchBotUglyUrlFilter.
	 */
	@Test
	public void assertRequestWithTheUpperCaseParamBypassesFilterChain() throws Exception {
		when(req.getParameterNames()).thenReturn(enumOf(SearchBotUglyUrlFilter.SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME.toUpperCase(Locale.ENGLISH)));
		filter.doFilter(req, res, filterChain);
		assertFilterChainWasBypassed();
	}

	/**
	 * Test of doFilter method, of class SearchBotUglyUrlFilter.
	 */
	@Test
	public void assertRequestWithTheParamAndIrrelevantParamsBypassesFilterChain() throws Exception {
		when(req.getParameterNames()).thenReturn(enumOf(
			"somethingIrrelevant" + SearchBotUglyUrlFilter.SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME,
			SearchBotUglyUrlFilter.SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME,
			"anotherSomethingIrrelevant" + SearchBotUglyUrlFilter.SEARCHBOT_ESCAPED_FRAGMENT_PARAM_NAME
		));
		filter.doFilter(req, res, filterChain);
		assertFilterChainWasBypassed();
	}

}
