package gov.usgs.nwc.nwcui.model;

public class Workflow {
	private String id;
	private String name;
	private String URI;
	private String image;
	
	public Workflow(String id, String name, String URI, String image) {
		this.id = id;
		this.name = name;
		this.URI = URI;
		this.image = image;
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getURI() {
		return URI;
	}
	
	public void setURI(String uRI) {
		URI = uRI;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}	
}
