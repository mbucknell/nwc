/*global angular*/
(function () {
    var aquaticBiologyControllers = angular.module('nwc.controllers.aquaticBiology', []);
    aquaticBiologyControllers.controller('AquaticBiology', [ '$scope', 'StoredState',
        NWC.ControllerHelpers.WorkflowController(
            {
                name: 'Aquatic Biology',
                description: 'Explore aquatic biology sites across the nation.'
            },
            function($scope, StoredState){
                
            }
        )
    ]);
    aquaticBiologyControllers.controller('SelectBioDataSite', [ '$scope', 'StoredState', 'AquaticBiologyMap',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Aquatic Biology Site Selection Map',
                description: 'Via the map interface, explore aquatic biology sites across the nation and select them to pursue further investigation in BioData'
            },
            function($scope, StoredState, AquaticBiologyMap){
            
                var map = AquaticBiologyMap.getMap();
                map.render('bioSiteSelectMap');
                map.zoomToExtent(map.extent, true);
                
                CommonState.activatedMapControl = 'select';
                
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
