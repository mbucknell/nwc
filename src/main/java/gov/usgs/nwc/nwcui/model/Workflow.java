package gov.usgs.nwc.nwcui.model;

public class Workflow {
	private String id;
	private String name;
	private String URI;
	private String image;
    private String description;
	
	public Workflow(String id, String name, String URI, String image, String description) {
		this.id = id;
		this.name = name;
		this.URI = URI;
		this.image = image;
        this.description = description;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

}
