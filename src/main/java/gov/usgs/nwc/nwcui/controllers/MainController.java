/*******************************************************************************
 * Project:		nwcui
 * Source:		MainController.java
 * Author:		Philip Russo
 ******************************************************************************/

package gov.usgs.nwc.nwcui.controllers;

import gov.usgs.nwc.nwcui.factories.WorkflowFactory;
import gov.usgs.nwc.nwcui.model.Workflow;
import gov.usgs.nwc.nwcui.model.cache.SiteCache;
import gov.usgs.nwc.nwcui.model.cache.dao.SiteCacheDao;
import gov.usgs.nwc.nwcui.utils.WebsiteUtils;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.ModelAndView; 

@Controller

public class MainController {
	private static Logger log = WebsiteUtils.getLogger(MainController.class);
	
	@Autowired
	private Environment env;
	
	@Autowired
	private SiteCacheDao cacheDao;
	
	@RequestMapping(value="/", method=RequestMethod.GET)
    public ModelAndView entry() {
		log.info("MainController.entry() Called");		
		
		ModelAndView mv = new ModelAndView("/main", "title", "Dashboard");
		
		/**
		 * Lets get all available workflows
		 * 
		 * 		In the future we can make a Workflow class that has all of the
		 * 		workflow information embedded into it passed back to the client.
		 */
		List<Workflow> workflows = WorkflowFactory.getInstance().getWorkflows();
		mv.addObject("workflows", workflows);
		
		/**
		 * Add the environment to the session so JSPs can grab their own properties
		 */
		mv.addObject("env", env);
		
		return mv;
    }
    
    	@RequestMapping(value = {"/ang/**"}, method=RequestMethod.GET)
    public ModelAndView specificWorkflow() {
		log.info("MainController.specificWorkflow() Called");

		ModelAndView mv = new ModelAndView("/workflow", "title", "");
		
		/**
		 * Add the environment to the session so JSPs can grab their own properties
		 */
		mv.addObject("env", env);
		
		return mv;
    }
	
	@RequestMapping(value="/savesession/{cachedobject}")
    public ModelAndView saveCachedSession(@PathVariable String cachedobject) {
		log.info("MainController.saveCachedSession() Called");
		
		/**
		 * We have the cached object from the client.  Lets as our URL path generator
		 * for a unique path to store.
		 */
		String path = UUID.randomUUID().toString();
		
		/**
		 * Now we got a path lets turn that path and the cached object into a SiteCache
		 * object and persist it to the db.
		 */
		cacheDao.saveSiteCache(new SiteCache(path, cachedobject));
		
		ModelAndView mv = new ModelAndView("/saved", "path", path);
		
		/**
		 * Add the environment to the session so JSPs can grab their own properties
		 */
		mv.addObject("env", env);
		
		return mv;
	}
	
	@RequestMapping(value="/savepoststart", method=RequestMethod.GET)
    public ModelAndView savePostStart() {
		log.info("MainController.savePostStart() Called");		
		
		ModelAndView mv = new ModelAndView("/savepoststart", "title", "Save Session Post Example");
		mv.addObject("version", WebsiteUtils.getApplicationVersion());
				
		/**
		 * Add the environment to the session so JSPs can grab their own properties
		 */
		mv.addObject("env", env);
		
		return mv;
    }
	
	@RequestMapping(value="/savesession", method = RequestMethod.POST)
	@ResponseBody
	public String saveCacheSessionPost(@RequestBody String cachedobject) {
		log.info("MainController.saveCacheSessionPost() Called");
		
		/**
		 * We have the cached object from the client.  Lets as our URL path generator
		 * for a unique path to store.
		 */
		String path = UUID.randomUUID().toString();
		
		/**
		 * Now we got a path lets turn that path and the cached object into a SiteCache
		 * object and persist it to the db.
		 */
		cacheDao.saveSiteCache(new SiteCache(path, cachedobject));
		
		return path;
	}
	
	@RequestMapping(value="/loadsession/{path}")
	@ResponseBody
	public String getCachedSession(@PathVariable String path) {
		log.info("MainController.getCachedSession() Called");
		
		/**
		 * Got a path, lets see if we can get it from the db
		 */
		SiteCache cacheobject = cacheDao.getSiteCacheByPath(path);
		
		return cacheobject.getCacheobject();
	}
}
