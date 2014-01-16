package gov.usgs.nwc.nwcui.model.cache.dao;

import gov.usgs.nwc.nwcui.model.cache.SiteCache;
import gov.usgs.nwc.nwcui.utils.NWCUtils;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.PersistenceContextType;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class SiteCacheDao {
	
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
	
	@PersistenceContext(type = PersistenceContextType.EXTENDED)
    private EntityManager entityManager;
	
	public List<SiteCache> getAllSiteCache() {
		List<SiteCache> sitecache = NWCUtils.castList(
				SiteCache.class,
                entityManager.createQuery("select sc from SiteCache sc",
                		SiteCache.class).getResultList());

		return sitecache;
	}
	
	public SiteCache getSiteCacheById(Long id) {
		return entityManager.find(SiteCache.class, id);
	}
	
	public SiteCache getSiteCacheByPath(String path) {
		return entityManager
				.createQuery("select sc from SiteCache sc where cachepath = '" + path + "'",
						SiteCache.class).getSingleResult();
	}
	
	@Transactional
	public void saveSiteCache(SiteCache cache) {
		entityManager.persist(cache);
	}
}
