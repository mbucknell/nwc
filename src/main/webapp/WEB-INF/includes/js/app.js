/*global angular*/
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
                    templateUrl: 'partials/Restoring.html',
                    controller: 'Restore'
                })
                .state('workflow', {
                    url: '/workflow',
                    templateUrl: '../../partials/AllWorkflowShell.html',
                    abstract: true
                })
                .state('workflow.waterBudget', {
                    url: '/water-budget',
                    templateUrl: '../../partials/waterBudget/waterBudgetTemplate.html',
                    controller: 'WaterBudget'
                })
                .state('workflow.waterBudget.selectHuc', {
                    url: '/select-huc',
                    templateUrl: '../../partials/waterBudget/selectHuc.html',
                    controller: 'SelectHuc'
                })
                .state('workflow.waterBudget.Final', {
                    url: '/final',
                    templateUrl: '../../partials/workflowA/FinalWaterBudget.html',
                    controller: 'FinalStep'
                });
    }
]);
