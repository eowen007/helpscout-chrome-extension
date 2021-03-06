(function(){
  var API_URL = 'https://api.helpscout.net/v1/';
  var http_headers;

  angular.module('options', [])
    .controller('HSClientController', ['$http', '$scope', function($http, $scope) {
      var http_headers =  {};

      $scope.init = function() {
        load_settings($scope.refresh_mailboxes);
      };

      $scope.refresh_mailboxes = function() {
    		var api_auth = 'Basic ' + Base64.encode($scope.api_key + ':X');
        http_headers = {
          headers: {
            'Authorization': api_auth,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };

        var endpoint = API_URL + 'mailboxes.json';
    		$http.get(endpoint, http_headers).success(function(data) {
          $scope.mailboxes = data.items;
          $scope.api_key_works = true;
        }).error(function() {
          $scope.api_key_works = false;
        });
      };

      $scope.clear_form = function() {
        $scope.api_key = undefined;
        $scope.mailbox = undefined;
        $scope.mailbox_obj = undefined;
        $scope.mailboxes = undefined;
        $scope.poll_interval = undefined;
        $scope.color_threshold = undefined;
      };

      $scope.save_settings = function() {
        var config = {
          'api_key': $scope.api_key,
          'mailbox': $scope.mailbox_obj,
          'poll_interval': $scope.poll_interval || 60,
          'color_threshold': $scope.color_threshold || 150
        };
        chrome.storage.sync.set({'config': config});

        var bgpg = chrome.extension.getBackgroundPage();
        bgpg.startPolling(config);

        chrome.tabs.getCurrent(function(tab) {
          chrome.tabs.remove(tab.id, function() {});
        });
      };

      load_settings = function(callback) {
        chrome.storage.sync.get('config', function(data) {
          var config = data.config;
          $scope.$apply(function() {
            if (config) {
              $scope.api_key = config.api_key;
              $scope.mailbox_obj = config.mailbox;
              if (config.poll_interval !== 60) {
                $scope.poll_interval = config.poll_interval;
              }
              if (config.color_threshold !== 150) {
                $scope.color_threshold = config.color_threshold;
              }
            }
            callback();
          });
        });
      };

      $scope.init();
    }]);

  angular.element(document).ready(
  	function() {
  		angular.bootstrap(document, ['options']);
  	}
  );
})();
