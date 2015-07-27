# National Water Census Data Portal

This repository houses the [National Water Census data portal.](http://cida.usgs.gov/nwc)

![alt text](http://cida.usgs.gov/nwc/img/workflow/originals/watershed.svg "National Water Census Data Portal")

## RUNNING 
 -  Install Java 7, Tomcat 7.
 -  Open the context.xml for the instance you are going to run this app in (Either $CATALINA_HOME/conf/context.xml or $CATALINA_BASE/conf/context.xml)
 -  Make your context.xml look like the following, substituting different values as neccessary:
```xml
<?xml version="1.0" encoding="utf-8"?>
<Context>
    <!-- Default set of monitored resources -->
    <WatchedResource>WEB-INF/web.xml</WatchedResource>

    <!-- disable session persistence across Tomcat restarts -->
    <Manager pathname="" />

	<Environment name="nwc.endpoint.geoserver" value="http://cida-eros-wsdev.er.usgs.gov:8081/geoserver/" type="java.lang.String" override="true"/>
        <Environment name="nwc.endpoint.thredds" value="http://cida-eros-wsdev.er.usgs.gov:8081/thredds/sos/watersmart/" type="java.lang.String" override="true"/>
        <Environment name="nwc.endpoint.wps" value="http://cida-eros-wsdev.er.usgs.gov:8081/wps/" type="java.lang.String" override="true"/>
        <Environment name="nwc.endpoint.nwis" value="http://waterservices.usgs.gov/nwis/site/" type="java.lang.String" override="true"/>
		<Environment name="nwc.endpoint.nwis.streamflow" value="http://waterservices.usgs.gov/nwis/dv/" type="java.lang.String" override="true"/>
        <Environment name="nwc.endpoint.searchService" value="http://txpub.usgs.gov/DSS/search_api/1.0/dataService/dataService.ashx/search" type="java.lang.String" override="true"/>
        <Environment name="nwc.endpoint.sciencebase" override="true" type="java.lang.String" value="https://www.sciencebase.gov"/>
</Context>
```
 -  Fork this repo
 -  Clone your forked repo
 -  change to the directory where you cloned your fork 
 -  Run `mvn clean package`. This will place a 'war' file in the 'target' directory
 -  Deploy the 'war' file to tomcat
