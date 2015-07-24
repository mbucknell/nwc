# National Water Census Data Portal

This repository houses the [National Water Census data portal.](http://cida.usgs.gov/nwc)

![alt text](http://cida.usgs.gov/nwc/img/workflow/originals/watershed.svg "National Water Census Data Portal")

## RUNNING 
 1. Install Java 7, Tomcat 7.
 1. Open the context.xml for the instance you are going to run this app in (Either $CATALINA_HOME/conf/context.xml or $CATALINA_BASE/conf/context.xml)
 1. Make your context.xml look like the following, substituting different values as neccessary:
```xml
<?xml version="1.0" encoding="utf-8"?>
<Context>
	<Environment name="nwc.endpoint.geoserver" value="http://cida-eros-wsdev.er.usgs.gov:8081/geoserver/" type="java.lang.String" override="true"/>
        <Environment name="nwc.endpoint.thredds" value="http://cida-eros-wsdev.er.usgs.gov:8081/thredds/sos/watersmart/" type="java.lang.String" override="true"/>
        <Environment name="nwc.endpoint.wps" value="http://cida-eros-wsdev.er.usgs.gov:8081/wps/" type="java.lang.String" override="true"/>
        <Environment name="nwc.endpoint.nwis" value="http://waterservices.usgs.gov/nwis/site/" type="java.lang.String" override="true"/>
        <Environment name="nwc.endpoint.searchService" value="http://txpub.usgs.gov/DSS/search_api/1.0/dataService/dataService.ashx/search" type="java.lang.String" override="true"/>
        <Environment name="nwc.endpoint.sciencebase" override="true" type="java.lang.String" value="https://www.sciencebase.gov"/>
</Context>
```
 1. Fork this repo
 1. Clone your forked repo
 1. change to the directory where you cloned your fork 
 1. Run `mvn clean package`. This will place a 'war' file in the 'target' directory
 1. Deploy the 'war' file to tomcat
