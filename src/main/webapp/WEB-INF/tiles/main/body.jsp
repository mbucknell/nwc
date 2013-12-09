<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@include file="/WEB-INF/base.jsp"%>

<div id="main_page" class="page_body_content">
	<div class="row dashboard" style="margin-right: 0px;">
		<div id="dashboard_nav" class="col-xs-3" style="min-width: 220px; margin-right: -15px;">
			<div id="dashboard_nav_contents" class="navContents">
				<div class="panel panel-default navigation_panel">
					<div class="panel-heading navigation_panel_heading">
						Workflows
					</div>
					<div class="panel-body navigation_panel_body" style="font-size: 12px;">
						<ul class="nav nav-pills">
							<c:forEach var="workflow" items="${workflows}" varStatus="status">
								<li class="navigation_panel_item">
									<a href="${context}${workflow.URI}" style="white-space: nowrap; padding: 10px;">${workflow.name}</a>
								</li>
							</c:forEach>
						</ul>
					</div>
				</div>
			</div>
		</div>
		<div id="dashboard_container" class="col-xs-9" style="min-width: 360px;  margin-left: 15px; padding: 10px; margin-bottom: -10px;">
			<!-- Dynamically build the dashboard depending on the workflow list -->
			<c:forEach var="workflow" items="${workflows}" varStatus="status">
				<!-- Add a new row div if this is an even item -->
				<c:if test="${status.index % 2 == 0}">
					<div class="row" style="padding-left: 10px; padding-right: 10px;">
				</c:if>
				
				<div class="col-xs-6" style="min-width: 346px; padding: 0px;">
					<div class="panel panel-default" style="margin: 10px;">
						<div class="panel-body">
							<a href="${context}${workflow.URI}">
								<img src="${context}${workflow.image}" style="width: 400px; margin-left: auto; margin-right: auto;" class="img-responsive" />
							</a>
						</div>
						<div class="panel-heading" style="text-align: center;">
							<a href="${context}${workflow.URI}">
								${workflow.name}
							</a>
						</div>
					</div>
				</div>
				
				<!-- close the row div if this is an odd item -->
				<c:if test="${(status.index % 2 == 1) or (status.last)}">
					</div>
				</c:if>
			</c:forEach>
		</div>
	</div>
</div>
<span id="hideNav" class="glyphicon glyphicon-chevron-right" style="position: absolute; top: 30px; left: 16px; font-size: 10px;"></span>

<script type="text/javascript">
	$(document).ready(function() {
		$('#hideNav').click(function() {
			//$('#dashboard_nav').animate({width: 'toggle'}).promise().done(function(){$('#dashboard_nav').toggle();});
			//$('#dashboard_nav').toggleClass("col-xs-3");
			//$('#dashboard_nav').toggleClass("col-xs-0");
			//$('#dashboard_content').toggleClass("col-xs-9");
			//$('#dashboard_content').toggleClass("col-xs-12");
			
			$('#dashboard_nav').toggleClass("col-xs-3 col-xs-0");
			$('#dashboard_container').toggleClass("col-xs-9 col-xs-12");
			$('#dashboard_nav *').children().toggleClass("col-xs-0");
			$('#hideNav').toggleClass("glyphicon-chevron-left glyphicon-chevron-right");
		});
	});
</script>

