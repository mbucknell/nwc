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
                .state('workflow.workflowA', {
                    url: '/workflowA',
                    templateUrl: '../../partials/workflowA/OneWorkflowShell.html',
                    controller: 'WorkflowA',
                    abstract: true
                })
                .state('workflow.workflowA.ColorSelection', {
                    url: '/step1',
                    templateUrl: '../../partials/workflowA/Step1.html',
                    controller: 'ColorSelectionStep'
                })
                .state('workflow.workflowA.NumberSelection', {
                    url: '/step2',
                    templateUrl: '../../partials/workflowA/Step2.html',
                    controller: 'NumberSelectionStep'
                })
                .state('workflow.workflowA.Final', {
                    url: '/final',
                    templateUrl: '../../partials/workflowA/FinalA.html',
                    controller: 'FinalStep'
                });
    }
]);
