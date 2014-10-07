angular.module('gsApp.workspaces.datastores.update', [])
.controller('UpdateStoreModalCtrl', ['$scope', '$modalInstance',
  'workspace', 'geoserver', 'store', '$rootScope',
  function ($scope, $modalInstance, workspace, geoserver, store,
    $rootScope) {

    $scope.title = 'Update Data Store';
    $scope.storeUndefined = false;

    $scope.workspace = workspace;
    $scope.geoserver = geoserver;
    $scope.store = store;

    if (!store) {
      $scope.storeUndefined = true;
    }

    $scope.cancel = function() {
      $modalInstance.dismiss('close');
    };

    $scope.save = function() {
      $modalInstance.dismiss('save');
      $rootScope.alerts = [{
        type: 'warning',
        message: 'Store update API is still in progress...',
        fadeout: true
      }];
    };

  }]);