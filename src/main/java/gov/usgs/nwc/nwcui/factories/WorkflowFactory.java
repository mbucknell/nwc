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
    	workflowMap.put("waterbudget", new Workflow("waterbudget", "Water Budget", "/ang/waterbudget/#/waterbudget/value1/value2", "/img/workflow/originals/waterBudget.png"));
    	workflowMap.put("aquaticbiology", new Workflow("aquaticbiology", "Aquatic Biology", "/ang/aquaticbiology/#/aquaticbiology/value1/value2", "/img/workflow/originals/acquaticBiodata.png"));
    	workflowMap.put("streamflowstats", new Workflow("streamflowstats", "Streamflow Stats", "/ang/streamflowstats/#/streamflowstats/value1/value2", "/img/workflow/originals/streamflowStatistics.png"));
    	workflowMap.put("datadiscovery", new Workflow("datadiscovery", "Data Discovery", "/ang/datadiscovery/#/datadiscovery/value1/value2", "/img/workflow/originals/acquaticBiodata.png"));
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
