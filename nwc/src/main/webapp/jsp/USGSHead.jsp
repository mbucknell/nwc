
<%@include file="/jsp/base.jsp"%>

<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

<title>National Water Census Data Portal</title>

<meta name="keywords" content="Water Availability, watershed, water use, water withdrawals,
      water availability, streamflow statistics, aquatic biology">

<meta name="description" content="Find national estimates of water availability,
      water budget components for local watersheds, water withdrawal data for counties, 
      tools to calculate statistics of daily streamflow records, modeled daily 
      streamflow at ungaged stations, and access to records of aquatic biology 
      observations.">

<!-- REWRITE: Twitter Bootstrap Meta -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- JQuery -->
<script type="text/javascript" src="webjars/jquery/${jqueryVersion}/jquery${jsMin}.js"></script>

<!-- Twitter Bootstrap -->
<link rel="stylesheet" type="text/css" href="webjars/bootstrap/${bootstrapVersion}/css/bootstrap${jsMin}.css"/>
<script type="text/javascript" src="webjars/bootstrap/${bootstrapVersion}/js/bootstrap${jsMin}.js"></script>
<!-- select 2 style -->
<link rel="stylesheet" type="text/css" href="webjars/select2/${select2Version}/select2.css" />
<link rel="stylesheet" type="text/css" href="webjars/select2/${select2Version}/select2-bootstrap.css" />
<!-- USGS CSS -->
<link rel="stylesheet" type="text/css" href="css/usgs_common<%= resourceSuffix %>.css"/>
<link rel="stylesheet" type="text/css" href="css/usgs_style_main<%= resourceSuffix %>.css"/>

<!-- Site CSS -->
<link rel="stylesheet" type="text/css" href="css/custom<%= resourceSuffix %>.css"/>
<link rel="stylesheet" type="text/css" href="webjars/font-awesome/${fontawesomeVersion}/css/font-awesome${jsMin}.css"/>

<!-- Our Bootstrap Theme -->
<link rel="stylesheet" type="text/css" href="css/theme1<%= resourceSuffix %>.css"/>

<!-- OpenLayers Theme -->
<link rel="stylesheet" type="text/css" href="webjars/openlayers/${openlayersVersion}/theme/default/style.css" />

<% 
    String gaAccountCode = request.getParameter("google-analytics-account-code");
    String[] gaCommandList = request.getParameterValues("google-analytics-command-set");
    
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
            ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var scripts = document.getElementsByTagName('script');
            var s = scripts[scripts.length-1]; s.parentNode.insertBefore(ga, s);
        })();

</script>
<% } %>

<%-- https://insight.usgs.gov/web_reengineering/SitePages/Analytics_Instructions.aspx --%>
<%-- https://insight.usgs.gov/web_reengineering/SitePages/Analytics_FAQs.aspx --%>
<% if (!development) { %>
<script type="application/javascript" src="http://www.usgs.gov/scripts/analytics/usgs-analytics.js"></script>
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-50928997-1', 'usgs.gov');
  ga('set', 'anonymizeIp', true);
  ga('send', 'pageview');

</script>
<% } %>
