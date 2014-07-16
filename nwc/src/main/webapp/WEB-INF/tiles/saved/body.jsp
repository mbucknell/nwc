<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@include file="/WEB-INF/base.jsp"%>

<div class="row" style="margin: 0px;">
	<div class="well">
		Use the following path to access this saved resource:<br />
			<a href="${context}/loadsession/${path}">${context}/loadsession/${path}</a>
	</div>
</div>