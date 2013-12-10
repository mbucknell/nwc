/*global clientular*/
var nwcui = angular.module('nwcui', [
    'nwcui.controllers',
    'nwcui.sharedStateServices',
    'ui.router',
    'ui.bootstrap'
]);

nwcui.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/workflow/workflowA/step1');

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
                .state('workflow.waterBudget.FinalStep', {
                    url: '/final',
                    templateUrl: '../../client/partials/waterBudget/FinalWaterBudget.html',
                    controller: 'FinalStep'
                });
    }
]);
