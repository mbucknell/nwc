package gov.usgs.cida.nwc.util;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.Ignore;

/**
 *
 * @author cschroed
 */
public class PrettyUglyUrlMapperTest {

	public static final List<PrettyUglyPair> prettyUglyPairs = Arrays.asList(
		new PrettyUglyPair("/#!key1=value1&key2=value2", "/?_escaped_fragment_=key1=value1%26key2=value2"),
		new PrettyUglyPair("/path#!hashfragment", "/path?_escaped_fragment_=hashfragment"),
		new PrettyUglyPair("/path?queryparams#!hashfragment", "/path?queryparams&_escaped_fragment_=hashfragment"),
		new PrettyUglyPair("/path", "/path?_escaped_fragment_="),
		new PrettyUglyPair("/path?queryparams", "/path?queryparams&_escaped_fragment_=")
	);
	
	public PrettyUglyUrlMapperTest() {
	}
	
	@BeforeClass
	public static void setUpClass() {
	}
	
	@AfterClass
	public static void tearDownClass() {
	}
	
	@Before
	public void setUp() {
	}
	
	@After
	public void tearDown() {
	}

	/**
	 * Test of uglyToPretty method, of class PrettyUglyUrlMapper.
	 */
	@Test
	public void testUglyToPretty() throws UnsupportedEncodingException, URISyntaxException {
		for(PrettyUglyPair pair : prettyUglyPairs){
			URI result = PrettyUglyUrlMapper.uglyToPretty(new URI(pair.ugly));
			assertEquals(new URI(pair.pretty), result);
		}
	}

	/**
	 * Test of prettyToUgly method, of class PrettyUglyUrlMapper.
	 */
	@Test
	public void testPrettyToUgly() throws URISyntaxException {
		for(PrettyUglyPair pair : prettyUglyPairs){
			URI result = PrettyUglyUrlMapper.prettyToUgly(new URI(pair.pretty));
			assertEquals(new URI(pair.ugly), result);
		}
	}
	
}
