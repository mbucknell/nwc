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
    'nwc.controllers.streamflowStatistics',
    'ui.router',
    'ui.bootstrap',
    'nwc.waterBudgetPlot',
    'nwc.waterUsageChart',
    'nwc.map.base',
    'nwc.map.waterBudget',
    'nwc.map.aquaticBiology',
    'nwc.map.streamflow',
    'checklist-model'
]);

nwcApp.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/workflow/aquatic-biology/select-biodata-site');
        var partialsBase = '../../client/nwc/partials/';
        $stateProvider
                .state('restore', {
                    url: '/state/restore/:stateId',
                    templateUrl: partialsBase + 'Restoring.html',
                    controller: 'Restore'
                })
                .state('workflow', {
                    url: '/workflow',
                    templateUrl: partialsBase + 'AllWorkflowShell.html',
                    abstract: true
                })
                .state('workflow.waterBudget', {
                    url: '/water-budget',
                    templateUrl: partialsBase + 'waterBudget/waterBudgetTemplate.html',
                    controller: 'WaterBudget'
                })
                .state('workflow.waterBudget.selectHuc', {
                    url: '/select-huc',
                    templateUrl: partialsBase + 'waterBudget/selectHuc.html',
                    controller: 'SelectHuc'
                })
                .state('workflow.waterBudget.disambiguateClick', {
                    url: '/disambiguate-click',
                    templateUrl: partialsBase + 'waterBudget/disambiguateClick.html',
                    controller: 'DisambiguateClick'
                })
                .state('workflow.waterBudget.plotData', {
                    url: '/plot-data',
                    templateUrl: partialsBase + 'waterBudget/plotData.html',
                    controller: 'PlotData'
                })
                .state('workflow.waterBudget.selectCounty', {
                    url: '/plot-data',
                    templateUrl: partialsBase + 'waterBudget/selectHuc.html',
                    controller: 'SelectCounty'
                })
                .state('workflow.aquaticBiology', {
                    url: '/aquatic-biology',
                    templateUrl: partialsBase + 'aquaticBiology/aquaticBiologyTemplate.html',
                    controller: 'AquaticBiology'
                })
                .state('workflow.aquaticBiology.selectBioDataSites', {
                    url: '/select-biodata-site',
                    templateUrl: partialsBase + 'aquaticBiology/selectBioDataSite.html',
                    controller: 'SelectBioDataSite'
                })
                .state('workflow.aquaticBiology.showSelectedBioDataSites', {
                    url: '/show-selected-biodata-sites',
                    templateUrl: partialsBase + 'aquaticBiology/showSelectedBioDataSites.html',
                    controller: 'ShowSelectedBioDataSites'
                })
                .state('workflow.aquaticBiology.sendToBioData', {
                    url: '/send-to-biodata',
                    templateUrl: partialsBase + 'aquaticBiology/sendToBioData.html',
                    controller: 'SendToBioData'
                })
                .state('workflow.waterBudget.FinalStep', {
                    url: '/final',
                    templateUrl: partialsBase + 'waterBudget/FinalWaterBudget.html',
                    controller: 'FinalStep'
                })
                .state('workflow.streamflowStatistics', {
                    url: '/streamflow-statistics',
                    templateUrl: partialsBase + 'streamflowStatistics/streamflowStatisticsTemplate.html',
                    controller: 'StreamflowStatistics'
                })
                .state('workflow.streamflowStatistics.selectSite', {
                    url: '/select-site',
                    templateUrl: partialsBase + 'streamflowStatistics/selectSite.html',
                    controller: 'SelectSite'
                })
                .state('workflow.streamflowStatistics.disambiguateGages', {
                    url: '/disambiguate-gages',
                    templateUrl: partialsBase + 'streamflowStatistics/disambiguateGages.html',
                    controller: 'DisambiguateGages'
                })
                .state('workflow.streamflowStatistics.setSiteStatisticsParameters', {
                    url: '/set-site-statistics-parameters',
                    templateUrl: partialsBase + 'streamflowStatistics/setSiteStatisticsParameters.html',
                    controller: 'SetSiteStatisticsParameters'
                })
                .state('workflow.streamflowStatistics.displayStatistics', {
                    url: '/display-statistics',
                    templateUrl: partialsBase + 'streamflowStatistics/displayStatistics.html',
                    controller: 'DisplayStatistics'
                });
    }
]);
