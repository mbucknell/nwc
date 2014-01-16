<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!-- Lets set the context path lookup to a variable for ease of use  -->
<c:set var="context" value="${pageContext.request.contextPath}"/>

<%
	/*
	 For future reference, use the session env variable to retrieve any      
	 application properties located in:                                      
	           ${catalina.home}/conf/nwc.site.properties                     
	                                                                         
	 In order for this to work, the env variable must be placed in the       
	 session by the controller:                                              
	           @Autowired                                                    
	           Environment env;                                              
	                                                                         
	           public ModelAndView someControllerMethod() {                  
	               ModelAndView mv = new ModelAndView("/route");             
	               mv.addObject("env", env);                                 
	               return mv;                                                
	           }                                                             
	                                                                         
	 JSP Example Usage:                                                      
	           <c:set var="dbURL" value="${env.getProperty("db.url")}" />
      */
%>