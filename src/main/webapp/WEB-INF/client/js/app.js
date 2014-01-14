/*global angular*/
var nwcApp = angular.module('nwcApp', [
    'nwc.sharedStateServices',
    'nwc.util',
    'nwc.watch',
    'nwc.dataSeriesStore',
    'nwc.sosSources',
    'nwc.sosResponseParser',
    'nwc.controllers.waterBudget',
    'nwc.controllers.aquaticBiology',
    'ui.router',
    'ui.bootstrap',
    'nwc.waterBudgetPlot',
    'nwc.map.base',
    'nwc.map.waterBudget',
    'nwc.map.aquaticBiology'
]);

nwcApp.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/workflow/aquatic-biology/select-biodata-site');

        $stateProvider
                .state('restore', {
                    url: '/state/restore/:stateId',
                    templateUrl: '../../client/partials/Restoring.html',
                    controller: 'Restore'
                })
                .state('workflow', {
                    url: '/workflow',
                    templateUrl: '../../client/partials/AllWorkflowShell.html',
                    abstract: true
                })
                .state('workflow.waterBudget', {
                    url: '/water-budget',
                    templateUrl: '../../client/partials/waterBudget/waterBudgetTemplate.html',
                    controller: 'WaterBudget'
                })
                .state('workflow.waterBudget.selectHuc', {
                    url: '/select-huc',
                    templateUrl: '../../client/partials/waterBudget/selectHuc.html',
                    controller: 'SelectHuc'
                })
                .state('workflow.waterBudget.disambiguateClick', {
                    url: '/disambiguate-click',
                    templateUrl: '../../client/partials/waterBudget/disambiguateClick.html',
                    controller: 'DisambiguateClick'
                })
                .state('workflow.waterBudget.plotData', {
                    url: '/plot-data',
                    templateUrl: '../../client/partials/waterBudget/plotData.html',
                    controller: 'PlotData'
                })
                .state('workflow.waterBudget.selectCounty', {
                    url: '/plot-data',
                    templateUrl: '../../client/partials/waterBudget/selectHuc.html',
                    controller: 'SelectCounty'
                })
                .state('workflow.aquaticBiology', {
                    url: '/aquatic-biology',
                    templateUrl: '../../client/partials/aquaticBiology/aquaticBiologyTemplate.html',
                    controller: 'AquaticBiology'
                })
                .state('workflow.aquaticBiology.selectBioDataSite', {
                    url: '/select-biodata-site',
                    templateUrl: '../../client/partials/aquaticBiology/selectBioDataSite.html',
                    controller: 'SelectBioDataSite'
                })
                .state('workflow.aquaticBiology.showSelectedBioDataSites', {
                    url: '/show-selected-biodata-sites',
                    templateUrl: '../../client/partials/aquaticBiology/showSelectedBioDataSites.html',
                    controller: 'ShowSelectedBioDataSites'
                })
                .state('workflow.waterBudget.FinalStep', {
                    url: '/final',
                    templateUrl: '../../client/partials/waterBudget/FinalWaterBudget.html',
                    controller: 'FinalStep'
                });
    }
]);
