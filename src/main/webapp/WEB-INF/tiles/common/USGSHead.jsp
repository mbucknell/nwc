<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@include file="/WEB-INF/base.jsp"%>

<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

<!-- REWRITE: Twitter Bootstrap Meta -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- JQuery -->
<script type="text/javascript" src="${context}/jquery/jquery-1.10.2.min.js"></script>

<!-- Twitter Bootstrap -->
<script type="text/javascript" src="${context}/bootstrap/js/bootstrap.min.js"></script>
<link rel="stylesheet" type="text/css" href="${context}/bootstrap/css/bootstrap.min.css"/>

<!-- Our Javascript -->
<script type="text/javascript" src="${context}/js/global.js"></script>

<!-- USGS CSS -->
<link rel="stylesheet" type="text/css" href="${context}/css/usgs_common.css"/>
<link rel="stylesheet" type="text/css" href="${context}/css/usgs_style_main.css"/>

<!-- Site CSS -->
<link rel="stylesheet" type="text/css" href="${context}/css/custom.css"/>

<!-- Our Bootstrap Theme -->
<script type="text/javascript" src="${context}/themes/theme1/theme1.js"></script>
<link rel="stylesheet" type="text/css" href="${context}/themes/theme1/theme1.css"/>

<% 
    String gaAccountCode = request.getParameter("google-analytics-account-code");
    String[] gaCommandList = request.getParameterValues("google-analytics-command-set");
    Boolean development = Boolean.parseBoolean(request.getParameter("development"));
    
    if (gaAccountCode != null && !gaAccountCode.trim().isEmpty()) { 
%>
<!-- Google Analytics Setup -->
<script type="text/javascript">
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', '<%= gaAccountCode %>']);
    _gaq.push (['_gat._anonymizeIp']);
    _gaq.push(['_trackPageview']);
    <% 
    if (gaCommandList != null && gaCommandList.length > 0) { 
        for (int commandIdx = 0;commandIdx < gaCommandList.length;commandIdx++) {
    %> 
        _gaq.push([<%= gaCommandList[commandIdx] %>]);
    <%
        }
    } 
    %>

        (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var scripts = document.getElementsByTagName('script');
            var s = scripts[scripts.length-1]; s.parentNode.insertBefore(ga, s);
        })();

</script>
<% } %>

<%-- https://insight.usgs.gov/web_reengineering/SitePages/Analytics_Instructions.aspx --%>
<%-- https://insight.usgs.gov/web_reengineering/SitePages/Analytics_FAQs.aspx --%>
<% if (!development) { %>
<script type="application/javascript" src="http://www.usgs.gov/scripts/analytics/usgs-analytics.js"></script>
<% } %>