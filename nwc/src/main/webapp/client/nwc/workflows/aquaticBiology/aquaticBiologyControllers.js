/*global angular*/
(function () {
    var aquaticBiologyControllers = angular.module('nwc.controllers.aquaticBiology', ['nwc.conversion', 'nwc.directive.GageList', 'nwc.directive.HucList']);
    aquaticBiologyControllers.controller('AquaticBiology', [ '$scope', 'StoredState', '$sce',
        NWC.ControllerHelpers.WorkflowController(
            {
                name: "Aquatic Biology Data and Related Streamflow Statistics",
                description: " Access aquatic biology data from the \n\
                    <a href=\"https://aquatic.biodata.usgs.gov\" target=\"_blank\">BioData</a> \n\
                    database and calculate streamflow statistics for near-by stream gages\n\
                    or model results. Select a collection of aquatic biology sites and\n\
                    access the data from the BioData system. Coming Soon: Select a collection\n\
                    of related stream-flow gages, specify a time range of interest, and\n\
                    choose statistics to receive. Software to calculate these statistics\n\
                    is also available as an open-source package on GitHub:\n\
                    <a href=\"https://github.com/USGS-R/EflowStats\" target=\"_blank\">\n\
                    https://github.com/USGS-R/EflowStats <i class=\"fa fa-external-link\"></i>."
            },
            function($scope, StoredState, $sce){
                $scope.description = $sce.trustAsHtml($scope.description);
            }
        )
    ]);
    
    aquaticBiologyControllers.controller('SelectBioDataSite', [ '$scope', 'StoredState', 'CommonState', 'AquaticBiologyMap', 'MapControlDescriptions',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Aquatic Biology Site Selection Map',
                description: 'Via the map interface, explore aquatic biology sites across the nation and select them to pursue further investigation in BioData'
            },
            function($scope, StoredState, CommonState, AquaticBiologyMap, MapControlDescriptions){
            
                var map = AquaticBiologyMap.getMap();
                map.render('bioSiteSelectMap');
                StoredState.mapExtent = StoredState.mapExtent || map.getMaxExtent();
                map.zoomToExtent(StoredState.mapExtent, true);
                map.events.register(
                    'moveend',
                    map,
                    function() {
                        StoredState.mapExtent = map.getExtent();
                    },
                    false
                );
        
                $scope.CommonState = CommonState;
                $scope.MapControlDescriptions = MapControlDescriptions;

            // Is triggered when either the "Both" or "None" buttons are pressed for Site Type in the aquatic biology area
            $scope.toggleActivatedStreamflowTypes = function(bool) {
                CommonState.activatedStreamflowTypes.nwis = bool;
                CommonState.activatedStreamflowTypes.sehuc12 = bool;
            };
                
            // I tried $watchCollection here since it's supposed to be used to watch arrays and objects but in this version
            // of AngularJS, newObject and oldObject are always the same coming through. This bug is noted here:
            // https://github.com/angular/angular.js/issues/2621
            // The workaround is using a boolean true as the third param into thr $watch function. According to the docs
            // at https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$watch this should not be used on complex
            // objects
            $scope.$watch('CommonState.activatedStreamflowTypes', function(newObject, oldObject) {
                if (newObject !== oldObject) {
                    AquaticBiologyMap.toggleSiteType(newObject);
                    // WATERSMART-398 - Due to page shifting on button press, the streamgage locations shift and the 
                    // click event doesn't seem to line up with where the gages actually are. Updating the map's size fixes the issue
                    AquaticBiologyMap.updateMapSize();
                }
            }, true);
                
                $scope.$watch('CommonState.activatedMapControl', function(newControl, oldControl) {
                    var controlId;
                    if (newControl === 'zoom') {
                        controlId = 'nwc-zoom';
                    } else if (newControl === 'pan') {
                        controlId = 'nwc-navigation';
                    } else {
                        controlId = 'nwc-biodata-sites';
                    }
                    if (newControl !== oldControl) {
                        // WATERSMART-398 - Due to page shifting on button press, the streamgage locations shift and the 
                        // click event doesn't seem to line up with where the gages actually are. Updating the map's size fixes the issue
                        AquaticBiologyMap.updateMapSize();
                        var controls = AquaticBiologyMap.getMap().getControlsBy('id', /nwc-.*/);
                        angular.forEach(controls, function(control) {
                            control.deactivate();
                        });
                    }
                    var activeControl = AquaticBiologyMap.getMap().getControlsBy('id', controlId)[0];
                    activeControl.activate();
                    CommonState.mapControlDescription = MapControlDescriptions[newControl].description;
                    CommonState.mapControlCursor = MapControlDescriptions[newControl].cursor;
                });
                
                CommonState.activatedMapControl = 'biosites';
                CommonState.mapControlDescription = MapControlDescriptions[CommonState.activatedMapControl].description;
                CommonState.mapControlCursor = MapControlDescriptions[CommonState.activatedMapControl].cursor;
                
            }
        )
    ]);
    aquaticBiologyControllers.controller('ShowSelectedBioDataSites', ['$scope', 'StoredState', 'CommonState', 'StoredState', 'GageListService', 'HucListService', 'Convert', '$state',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Aquatic Biology Site Selection List',
                description: 'Select which sites to explore in BioShare'
            },
            function ($scope, StoredState, CommonState, StoredState, gageListService, hucListService, Convert, $state) {
                $scope.CommonState = CommonState;
                $scope.StoredState = StoredState;
                
                //if WFS call found stream gages, set up the directive
                $scope.streamGages = StoredState.bioNearbyStreamGages;
    	    	//set up scope fields for nwcGageList directive (see GageList.js for directive information)
                gageListService.setScopeParams(
        			$scope,
        			'Stream Gages',
        			'Your selection landed near multiple stream gages. Select a gage to calculate streamflow statistics.',
        			$scope.streamGages, 
        	        function(gage) {
        				CommonState.streamflowStatsParamsReturnTarget = 'workflow.aquaticBiology.showSelectedBioDataSites';
        	    		StoredState.gage = gage; //this triggers the next workflow step, watched by nwc.watch
        	    		StoredState.siteStatisticsParameters = {};
        	    	}	
        		);
        		
                //if WFS found HUCS, set up directing
                $scope.hucs = StoredState.bioNearbyHucs;
                hucListService.setScopeParams(
            			$scope,
            			'Watersheds',
            			'Your selection landed near multiple watersheds. Select a HUC to calculate modeled streamflow statistics.',
            			$scope.hucs, 
            	        function(huc) {
            				CommonState.streamflowStatsParamsReturnTarget = 'workflow.aquaticBiology.showSelectedBioDataSites';
            				//TODO this was copy/pasted from streamflowMap.js, need to DRY out
                            var minStatDate = Date.create('1980/10/01').utc();
                            var maxStatDate = Date.create('2010/09/30').utc();
                            StoredState.streamFlowStatHucFeature = huc;
                            CommonState.streamFlowStatMinDate = minStatDate;
                            CommonState.streamFlowStatMaxDate = maxStatDate;
                            StoredState.siteStatisticsParameters = {};
                            var statisticsParameters = StoredState.siteStatisticsParameters;
                            statisticsParameters.startDate = Date.create(minStatDate).utc();
                            statisticsParameters.endDate = Date.create(maxStatDate).utc();
                            var km2 = Convert.acresToSquareKilometers(
                                    Convert.squareMilesToAcres(StoredState.streamFlowStatHucFeature.data.mi2));
                            if (km2 > 2000) {
                                alert("Hydrologic model results are not valid for watersheds this large (" + km2.round(0) + " km^2), please choose a smaller watershed.");
                            } else {
                                $state.go('workflow.streamflowStatistics.setSiteStatisticsParameters');
                            }
            	    	}	
            		);
                
                StoredState.selectedAquaticBiologySites = StoredState.selectedAquaticBiologySites || [];

				//process "select all" checkbox	
				$scope.processSelectAll = function () {
				
					//default is to clear selection
					StoredState.selectedAquaticBiologySites = [];
					
					//if "select all" is checked then push whole list to selected array
					if ($scope.allSelected) {
						angular.forEach(StoredState.aquaticBiologySites, function (cb, index) {
							StoredState.selectedAquaticBiologySites.push(cb.attributes.SiteNumber);	
						});
					} 				
				};
				
				//control "select all" checkbox based on current list selections
				 $scope.$watch('StoredState.selectedAquaticBiologySites', function(list) { 
					//if total list and selected list are different uncheck "select all"
					if (StoredState.aquaticBiologySites && list.length != StoredState.aquaticBiologySites.length) {		
						$scope.allSelected = false;
					}
					//assume everything is selected so check "select all" box
					else {
						$scope.allSelected = true;
					}
				 }, true);


                $scope.noSitesSelected = function () {
                    //boolean cast
                    return StoredState.selectedAquaticBiologySites.length === 0;
                };
            }
        )
    ]);
    
    var bioDataSiteSelectionDoc; //lazy-loaded
    
    aquaticBiologyControllers.controller('SendToBioData', ['$scope', 'StoredState', 'CommonState', 'StoredState',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Preparing To Explore in BioData',
                description: 'Please wait...'
            },
            function ($scope, StoredState, CommonState, StoredState) {
                $scope.CommonState = CommonState;
                $scope.StoredState = StoredState;

                /**
                 * @param {array<String>} siteIds
                 */
                var preselectBioDataSites = function (siteIds) {
                    var doc = bioDataSiteSelectionDoc;
                    var siteNumbersElt = $(doc).find('siteNumbers').empty()[0];
                    siteIds.each(function (siteId) {
                        var child = doc.createElement('siteNumber');
                        child.textContent = siteId;
                        siteNumbersElt.appendChild(child);
                    });

                    //serialize xml document
                    var xmlString = "";
                    
                    try {
                    	xmlString = (new XMLSerializer()).serializeToString(doc);
                    } catch(e) {}

                    //Give IE a shot
                    if (xmlString.length <= 0 && window.ActiveXObject) {
                        xmlString = doc.xml;
                    }

                    $("[name='currentQuery']").val(xmlString);
                    $('#bioData_form').submit();
                };
                var siteIds = StoredState.selectedAquaticBiologySites;

                if (bioDataSiteSelectionDoc) {
                    preselectBioDataSites(siteIds);
                } else {
                    //retrieve document from server
                    $.when($.get('../client/nwc/misc/BioDataSiteSelection.xml')).then(
                        function (response, status, jqXHR) {
                            bioDataSiteSelectionDoc = response;
                            preselectBioDataSites(siteIds);
                        },
                        function (response, status, jqXHR) {
                            alert("Error Retrieving BioData query skeleton");
                        }
                    );

                }
            }
        )
    ]);
}());
