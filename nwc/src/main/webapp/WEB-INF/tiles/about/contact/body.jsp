<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>


<div class="col-xs-12">
	<h1>${title}</h1>
		
	<h4>Content: ${content}</h4>
		<div class="well" style="background-color: white;">
			<legend>JSTL Example - Request Header</legend>
			<table class="table table-striped">
				<thead>
					<tr>
						<th>#</th>
						<th>Request Header Name</th>
						<th>Request Header Value</th>
					</tr>
				</thead>
				<tbody>
				<c:forEach var="mapping" items="${header}" varStatus="index">
					<tr>
						<td><c:out value="${index.count}"/></td>
						<td><c:out value="${mapping.key}"/></td>
						<td><c:out value="${mapping.value}"/></td>
					</tr>
				</c:forEach>
				</tbody>
			</table>
		</div>
		
		<div class="well" style="background-color: white;">
			<legend>JSTL Example - Page Scope</legend>
			<table class="table table-striped">
				<thead>
					<tr>
						<th>#</th>
						<th>Page Scope Variable</th>
						<th>Page Scope Value</th>
					</tr>
				</thead>
				<tbody>
				<c:forEach var="mapping" items="${pageScope}" varStatus="index">
					<tr>
						<td><c:out value="${index.count}"/></td>
						<td><c:out value="${mapping.key}"/></td>
						<td><c:out value="${mapping.value}"/></td>
					</tr>
				</c:forEach>
				</tbody>
			</table>
		</div>
		
		<div class="well" style="background-color: white;">
			<legend>JSTL Example - Request Scope</legend>
			<table class="table table-striped">
				<thead>
					<tr>
						<th>#</th>
						<th>Request Scope Variable</th>
						<th>Request Scope Value</th>
					</tr>
				</thead>
				<tbody>
				<c:forEach var="mapping" items="${requestScope}" varStatus="index">
					<tr>
						<td><c:out value="${index.count}"/></td>
						<td><c:out value="${mapping.key}"/></td>
						<td><c:out value="${mapping.value}"/></td>
					</tr>
				</c:forEach>
				</tbody>
			</table>
		</div>
		
		<div class="well" style="background-color: white;">
			<legend>JSTL Example - Application Scope</legend>
			<table class="table table-striped">
				<thead>
					<tr>
						<th>#</th>
						<th>Application Scope Variable</th>
						<th>Application Scope Value</th>
					</tr>
				</thead>
				<tbody>
				<c:forEach var="mapping" items="${applicationScope}" varStatus="index">
					<tr>
						<td><c:out value="${index.count}"/></td>
						<td><c:out value="${mapping.key}"/></td>
						<td><c:out value="${mapping.value}"/></td>
					</tr>
				</c:forEach>
				</tbody>
			</table>
		</div>
</div>
