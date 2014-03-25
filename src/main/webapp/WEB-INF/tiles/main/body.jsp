<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@include file="/WEB-INF/base.jsp"%>

<div id="main_page" class="page_body_content">
	<div id="full_dashboard" class="row dashboard navigation_toggle_a">
		<div id="dashboard_nav" class="col-xs-3" style="min-width: 220px; margin-right: -15px;">
			<div id="dashboard_nav_contents" class="navContents">
				<div class="panel panel-default navigation_panel">
                    <div class="panel-heading navigation_panel_heading">
                        <ul class="nav nav-pills">
                            <li class="navigation_panel_item">
                                <a data-toggle="collapse" href="#menuCollapse"><i class="fa fa-bars fa-fw"></i> Menu</a>
                            </li>
                        </ul>
                    </div>
					<div id="menuCollapse" class="panel-body navigation_panel_body collapse" style="font-size: 12px;">
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
		<div id="dashboard_container" class="nwc-container col-xs-9" style="min-width: 360px;  margin-left: 15px; padding: 10px; margin-bottom: -10px;">
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