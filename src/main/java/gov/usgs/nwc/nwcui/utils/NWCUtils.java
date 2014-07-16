package gov.usgs.nwc.nwcui.utils;

import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.apache.commons.lang.StringUtils;

public class NWCUtils {
	public static String generateMD5ForString(String value) {		
		// Create the digest object
		MessageDigest digest;
		try {
			digest = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return "";
		}
		
		// Extract the string's "bytes" but make sure its UTF-8
		byte[] valueBytes;
		try {
			valueBytes = value.getBytes("UTF-8");
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return "";
		}
		
		// Update the digest object w/ the byte array
	    digest.update(valueBytes);
	    
	    // Create the md5 hash
	    byte[] hash = digest.digest();
	    
	    // Convert the hash back to a string for storage
	    BigInteger bigInt = new BigInteger(1, hash);
	    String hashtext = bigInt.toString(16);
	    
	    // Now we need to zero pad it if you actually want the full 32 chars.
	    hashtext = StringUtils.leftPad(hashtext, 32, '0');
		return hashtext;
	}
	
	public static Long generateId(String value) {
		final String hash = NWCUtils.generateMD5ForString(value);
		final BigInteger bigIntVersion = new BigInteger(hash, 16);
				
		return bigIntVersion.longValue();
	}
	
	public static <T> List<T> castList(Class<? extends T> clazz, Collection<?> c) {
        List<T> r = new ArrayList<T>(c.size());
        for(Object o: c)
          r.add(clazz.cast(o));
        return r;
    }
}
