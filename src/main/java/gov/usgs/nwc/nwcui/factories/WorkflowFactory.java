package gov.usgs.nwc.nwcui.factories;

import gov.usgs.nwc.nwcui.model.Workflow;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WorkflowFactory {
	private static final WorkflowFactory INSTANCE = new WorkflowFactory();        
    private static Map<String, Workflow> workflowMap;
    
    private WorkflowFactory() {
    	WorkflowFactory.workflowMap = new HashMap<String, Workflow>();
    	workflowMap.put("waterbudget", new Workflow("waterbudget", "Water Budget", "/ang/#/workflow/water-budget/select-huc", "/img/workflow/originals/watershed.svg"));
    	workflowMap.put("aquaticbiology", new Workflow("aquaticbiology", "Aquatic Biology", "/ang/#/workflow/aquatic-biology/select-biodata-site", "/img/workflow/originals/shield-01.svg"));
    	workflowMap.put("streamflowstats", new Workflow("streamflowstats", "Streamflow Stats", "/ang/#/workflow/streamflow-statistics/select-site", "/img/workflow/originals/form-01.svg"));
    	workflowMap.put("datadiscovery", new Workflow("datadiscovery", "Data Discovery", "/ang/#/workflow/datadiscovery/", "/img/workflow/originals/folder-01.svg"));
    }
    
    public static WorkflowFactory getInstance() {
            return INSTANCE;
    }
    
    public static void addWorkflow(String id, String workflowName, String workflowPath, String image) {                
            Workflow workflow = new Workflow(id, workflowName, workflowPath, image);
            
            if(workflow != null) {
            	workflowMap.put(workflowName, workflow);
            }
    }
    
    public Workflow getWorkflow(String workflowName) {
            return workflowMap.get(workflowName);
    }
    
    public List<Workflow> getWorkflows() {
    	List<String> keys = new ArrayList<String>(workflowMap.keySet());
    	Collections.sort(keys);
    	
    	List<Workflow> workflows = new ArrayList<Workflow>();
    	for(String key : keys) {
    		workflows.add(workflowMap.get(key));
    	}
    	
    	return workflows;    	
    }
    
    public Map<String, Workflow> getWorkflowsMap() {
    	return workflowMap;    	
    }
}
