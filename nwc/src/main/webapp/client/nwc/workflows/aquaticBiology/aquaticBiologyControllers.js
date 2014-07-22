/*global angular*/
(function () {
    var aquaticBiologyControllers = angular.module('nwc.controllers.aquaticBiology', []);
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
    aquaticBiologyControllers.controller('ShowSelectedBioDataSites', ['$scope', 'StoredState', 'CommonState', 'StoredState',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Aquatic Biology Site Selection List',
                description: 'Select which sites to explore in BioShare'
            },
            function ($scope, StoredState, CommonState, StoredState) {
                $scope.CommonState = CommonState;
                $scope.StoredState = StoredState;
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
                    var xmlString;
                    //IE
                    if (window.ActiveXObject) {
                        xmlString = doc.xml;
                    } else {
                        // code for Mozilla, Firefox, Opera, etc.
                        xmlString = (new XMLSerializer()).serializeToString(doc);
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
