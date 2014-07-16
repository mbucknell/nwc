<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@include file="/WEB-INF/base.jsp"%>

<div class="row" style="margin: 0px;">
	<div class="well">
	
		<form role="form" action="${context}/savesessionpost" method="POST">
			<div class="form-group">
				<label for="cacheObject">Cache Object</label>
				<input type="text" class="form-control" placeholder="Cache Object" name="cachedobject">
			</div>
			<button type="submit" class="btn btn-default">Submit</button>
		</form>

	</div>
</div>