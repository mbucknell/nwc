<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>


<div class="col-xs-12">
	<h1>${title}</h1>
		
	<h4>Content: ${content}</h4>
	<div class="well" style="background-color: white;">
		<legend>JSTL Example - Random Strings and Numbers</legend>
		<table class="table table-striped">
			<thead>
				<tr>
					<th>#</th>
					<th>Random String</th>
					<th>Random Number</th>
				</tr>
			</thead>
			<tbody>
			<c:forEach var="mapping" items="${randomStringsAndNumbers}" varStatus="index">
				<tr>
					<td><c:out value="${index.count}"/></td>
					<td><c:out value="${mapping.key}"/></td>
					<td><fmt:formatNumber type="number" maxFractionDigits="0" value="${mapping.value}" /></td>
				</tr>
			</c:forEach>
			</tbody>
		</table>
	</div>
</div>
