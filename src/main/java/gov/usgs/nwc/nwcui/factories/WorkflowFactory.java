package gov.usgs.nwc.nwcui.factories;

import gov.usgs.nwc.nwcui.model.Workflow;

import java.util.LinkedList;
import java.util.List;

public class WorkflowFactory {
	private static final WorkflowFactory INSTANCE = new WorkflowFactory();        
    private static List<Workflow> workflowList;

    private WorkflowFactory() {
    	WorkflowFactory.workflowList = new LinkedList<>();
    	workflowList.add(new Workflow("waterbudget", "Water Budget", "/ang/#/workflow/water-budget/select-huc", "/img/workflow/originals/watershed.svg", "Discover water budget data for watersheds and counties."));
        workflowList.add(new Workflow("streamflowstats", "Streamflow Stats", "/ang/#/workflow/streamflow-statistics/select-site", "/img/workflow/originals/form-01.svg", "Access streamflow statistics for stream gages and model results."));
    	workflowList.add(new Workflow("aquaticbiology", "Aquatic Biology", "/ang/#/workflow/aquatic-biology/select-biodata-site", "/img/workflow/originals/shield-01.svg", "Access aquatic biology data and streamflow statistics for related sites."));    	
    	workflowList.add(new Workflow("datadiscovery", "Data Discovery", "/ang/#/workflow/data-discovery", "/img/workflow/originals/folder-01.svg", "Search and browse datasets, publications, and project descriptions."));
    }
    
    public static WorkflowFactory getInstance() {
        return INSTANCE;
    }
    
    public static void addWorkflow(String id, String workflowName, String workflowPath, String image, String description) {                
        Workflow workflow = new Workflow(id, workflowName, workflowPath, image, description);
        workflowList.add(workflow);
    }
    
    public List<Workflow> getWorkflows() {
    	return workflowList;    	
    }
}
