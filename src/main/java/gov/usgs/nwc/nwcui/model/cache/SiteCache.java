package gov.usgs.nwc.nwcui.model.cache;

import gov.usgs.nwc.nwcui.utils.NWCUtils;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "sitecache")
public class SiteCache {
	/**
		CREATE TABLE sitecache
		(
			id SERIAL NOT NULL,
			cacheid BIGINT,
			cachepath TEXT,
			cacheobject TEXT,
			created TIMESTAMP,
			lastaccessed TIMESTAMP,
			PRIMARY KEY (id)
		);
	 */
	
	@Id
	@SequenceGenerator( name = "siteCacheSeq", sequenceName = "sitecache_id_seq", allocationSize = 1, initialValue = 1 )
	@GeneratedValue( strategy = GenerationType.SEQUENCE, generator = "siteCacheSeq" )
	@Column( name = "id" )
	private Long id;
	
	private Long cacheid;
	private String cachepath;
	private String cacheobject;
	private Date created;
	private Date lastaccessed;
	
	/**
	 * Default Constructor
	 */
	public SiteCache() {}
	
	/**
	 * Create a SiteCache object with the given path
	 */
	public SiteCache(String path, String object) {
		this.cachepath = path;
		this.cacheid = NWCUtils.generateId(path);
		this.cacheobject = object;
		
		Date current = new Date();
		this.created = current;
		this.lastaccessed = current;
	}
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getCacheid() {
		return cacheid;
	}
	
	public void setCacheid(Long cacheid) {
		this.cacheid = cacheid;
	}
	
	public String getCachepath() {
		return cachepath;
	}

	public void setCachepath(String cachepath) {
		this.cachepath = cachepath;
	}

	public String getCacheobject() {
		return cacheobject;
	}
	
	public void setCacheobject(String cacheobject) {
		this.cacheobject = cacheobject;
	}
	
	public Date getCreated() {
		return created;
	}
	
	public void setCreated(Date created) {
		this.created = created;
	}
	
	public Date getLastaccessed() {
		return lastaccessed;
	}
	
	public void setLastaccessed(Date lastaccessed) {
		this.lastaccessed = lastaccessed;
	}
	
	@Override
    public String toString() {
            StringBuffer result = new StringBuffer();
            result.append("[SITECACHE] ID: " + this.cacheid + ", PATH: " + this.cachepath + ", CREATED: " + this.created +
            			  ", LAST-ACCESSED: " + this.lastaccessed + ", OBJECT:\n[\n" + this.cacheobject + "\n]");
            
            return result.toString();
    }

}
