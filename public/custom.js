var app = angular.module("msi-goApps-goApps", ['ui.router', 'ui.bootstrap', 'ngResource', 'ngStorage', 'ngAnimate','datePicker','ngTable','angular-js-xlsx','WebService','ui.utils','textAngular','Logger']);
app.config(["$stateProvider", "$urlRouterProvider", "$httpProvider", function($stateProvider, $urlRouterProvider,$httpProvider) {
  checkLoggedin.$inject = ["$q", "$timeout", "$rootScope", "$http", "$state", "$localStorage"];
  checkLoggedout.$inject = ["$q", "$timeout", "$rootScope", "$state", "$http", "$localStorage", "UserModel"];
  $httpProvider.interceptors.push(["$q", "$location", "$window", "$localStorage", "Constants", function ($q, $location, $window,$localStorage,Constants) {
    return {
      request: function (config) {
        var isSignInUrl = config.url.indexOf('login') > -1 ? true : false;
        if($localStorage.token ){
          config.headers = config.headers || {};
          config.headers['Authorization'] = 'bearer '+$localStorage.token;
        }
        if(Constants.debug) {
          console.log("calling web service ->>>>>>>>>>>" , config.url);
          console.log("Data web service ->>>>>>>>>>>" , JSON.stringify(config.data));
        }
        return config;
      },
      response: function (response) {
        if (response.status === 401) {
          $location.path('/');
        }
        return response || $q.when(response);
      }
    };
  }]);
  $urlRouterProvider.otherwise('/login');
  $stateProvider
  .state('login', {
    templateUrl: 'view/common/login.html',
    url: '/login',
    controller:'Login_Controller',
    resolve: {
     loggedout: checkLoggedin
    }
  })
  .state('vle', {
    templateUrl: '/view/vle_registration.html',
    url: '/vle',
    controller:'User_Controller',
    resolve: {
     loggedout: checkLoggedin
    }
  })
  .state('dashboard', {
    templateUrl: '/view/dashboard.html',
    url: '/dashboard',
    controller:'User_Controller',
     resolve: {
      loggedout: checkLoggedout
    }

  })
  .state('vle-list', {
    templateUrl: '/view/vle_list.html',
    url: '/vle-list/:urban',
    params:{
      urban:null
    },
    controller:'User_Controller',
     resolve: {
      loggedout: checkLoggedout
    }
  })
  .state('district', {
    templateUrl: '/view/districtList.html',
    url: '/district/:isCover',
    controller:'DashBoardController',
    params:{isCover:null},
     resolve: {
      loggedout: checkLoggedout
    }
  })
  .state('block', {
    templateUrl: '/view/blockList.html',
    url: '/block/:isCover',
    controller:'DashBoardController',
    params:{isCover:null},
     resolve: {
      loggedout: checkLoggedout
    }
  })
  .state('gp', {
    templateUrl: '/view/gpList.html',
    url: '/gp/:isCover',
    controller:'DashBoardController',
    params:{isCover:null},
     resolve: {
      loggedout: checkLoggedout
    }
  })
  .state('thankYou', {
    templateUrl: '/view/thankYou.html',
    url: '/registration-complete',
    controller:'User_Controller',
  })

  .state('change-password', {
     templateUrl: 'view/change_password.html',
     url: '/change-password',
     controller:'Main_Controller',
     resolve: {
       loggedout: checkLoggedout
     }
   })


  function checkLoggedout($q, $timeout, $rootScope, $state,$http, $localStorage,UserModel) {
    var deferred = $q.defer();
    $http.get('/user/loggedin')
    .success(function (response) {
      $timeout(function(){
        $rootScope.is_loggedin = true;
          UserModel.setUser(response.user);
          console.log("$state >>>>> ",$state.current.name)
          deferred.resolve();
      },200)
    })
    .error(function (error) {
      $timeout(function(){
        $localStorage.token = null;
        $rootScope.is_loggedin = false;
        deferred.resolve();
        $state.go('login');
      },200)
    })
  }
  function checkLoggedin($q, $timeout, $rootScope,$http, $state, $localStorage) {
    var deferred = $q.defer();
    $http.get('/user/loggedin')
    .success(function(response) {
      $timeout(function(){
        $rootScope.is_loggedin = true;
        deferred.resolve();
        $state.go('dashboard');
      },200)
    })
    .error(function(error){
      $timeout(function(){
        $localStorage.token = null;
        $rootScope.is_loggedin = false;
        deferred.resolve();
      },200)
    })
  }
}]);
app.run(["$http", "$rootScope", "$localStorage", "$timeout", "EnvService", "Constants", function($http,$rootScope,$localStorage,$timeout,EnvService,Constants){
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    $rootScope.stateName = toState.name;
  })
  EnvService.setSettings(Constants);
}]);
app.factory('Util', ['$rootScope',  '$timeout' , function( $rootScope, $timeout){
  var Util = {};
  $rootScope.alerts =[];
  Util.alertMessage = function(msgType, message){
    if(!message){
      message = msgType;
    }
    var alert = { type:msgType , msg: message };
    $rootScope.alerts.push( alert );
    $timeout(function(){
      $rootScope.alerts.splice($rootScope.alerts.indexOf(alert), 1);
    }, 5000);
  };
  return Util;
}]);
app.filter('getShortName', function () {
  return function (value) {
    if(value){
      var temp = angular.copy(value);
      temp = temp.split(" ");
      temp = temp[0].charAt(0)+temp[temp.length-1].charAt(0);
      return temp.toUpperCase();
    }
  };
});
;app.filter('dateformat', function(){
  return function(date){
    if(date){
      return moment(date).format("DD MMM, YYYY");
    }
  }
});
app.filter('getShortName', function () {
    return function (value) {
      if(value){
        var temp = angular.copy(value);
        temp = temp.split(" ");
        temp = temp[0].charAt(0)+temp[temp.length-1].charAt(0);
        return temp.toUpperCase();
      }
    };
});
app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0,3).toUpperCase() : '';
    }
});;app.constant("Constants", {
        "debug":false,
        "storagePrefix": "goAppAccount$",
        "getTokenKey" : function() {return this.storagePrefix + "token";},
        "getLoggedIn" : function() {return this.storagePrefix + "loggedin";},
        "alertTime"   : 3000,
        "getUsername" : function() {return this.storagePrefix + "username";},
        "getPassword" : function() {return this.storagePrefix + "password";},
        "getIsRemember" : function() {return this.storagePrefix + "isRemember";},
        "hashKey" : "goAppAccount",
        "envData" : {
          "env":"dev",
          "dev" : {
            "basePath" :"http://localhost",
            "appPath"  :"http://localhost",
          },
          "prod" : {
            "basePath" :"http://ec2-52-23-158-141.compute-1.amazonaws.com",
            "appPath"  :"http://ec2-52-23-158-141.compute-1.amazonaws.com",
          }
        },
});
;angular.module('Logger', [])
  .factory('LOG', ["$rootScope", "$timeout", function($rootScope,$timeout) {
    return {
      debug: function(message) {
        console.log(message);
      },
      info: function(message) {
        var alert = { type:"success" , msg: message };
        $rootScope.alerts.push( alert );
        $timeout(function(){
          $rootScope.alerts.splice($rootScope.alerts.indexOf(alert), 1);
        }, 5000);
      },
      error: function(message) {
        var alert = { type:"error" , msg: message };
        $rootScope.alerts.push( alert );
        $timeout(function(){
          $rootScope.alerts.splice($rootScope.alerts.indexOf(alert), 1);
        }, 5000);
      },
    }
  }])
;angular.module('WebService', [])
.factory('API', ["$http", "$resource", "EnvService", function($http, $resource, EnvService) {
  return {
    getRole: {
      "url": "/role",
      "method": "GET",
      "headers": {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
    },
    getDashboard: {
      "url": "/user/dashboard",
      "method": "GET",
      "headers": {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
    },

    postRole: {
      url: "/role",
      method: "POST",
      "headers": {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
    },
    updateRole: {
      url: "/role/",
      method: "PUT",
      "headers": {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
    },
    deleteRole: {
      url: "/role/:_id",
      method: "DELETE",
      "headers": {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
    },
    userLogin : {
      url : "/user/login",
      method : "POST"
    },
    getUser : {
      url:"/user/",
      method: "GET"
    },
    postUser: {
      url: "/user/",
      method: "POST",
      "headers": {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
    },
    deleteUser: {
        url: "/user/:_id",
        method: "DELETE",
        "headers": {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    },
    updateUser: {
        url: "/user/",
        method: "PUT",
        "headers": {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    },

    getDistrict:{
      url:"/common/district",
       method: "GET",
    },
    getBlocks:{
      url:"/common/block",
       method: "GET",
    },
    getGPs:{
      url:"/common/gp",
       method: "GET",
    },
    getVle: {
      "url": "/vle",
      "method": "GET",
    },
    getAreatCount: {
      "url": "/vle/district",
      "method": "GET",
    },
    forgotPassword: {
        url: "/user/forgotPassword",
        method: "PUT",
        "headers": {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    },
    changePassword: {
        url: "/user/changePassword",
        method: "PUT",
        "headers": {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    },
    registerVle: {
        url: "/vle",
        method: "POST",
        "headers": {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    },
    exportExcel: {
        url: "/vle/exportExcel",
        method: "GET",
        "headers": {
        },
    },
    exportVleSummary: {
        url: "/vle/exportVleSummary",
        method: "GET",
        "headers": {
        },
    },
  }
}])
.factory('ApiCall', ["$http", "$resource", "API", "EnvService", "ApiGenerator", function($http, $resource, API, EnvService,ApiGenerator) {
  return $resource('/',null, {
    getRole: ApiGenerator.getApi('getRole'),
    userLogin : ApiGenerator.getApi('userLogin'),
    getUser: ApiGenerator.getApi('getUser'),
    postUser: ApiGenerator.getApi('postUser'),
   registerVle: ApiGenerator.getApi('registerVle'),
    changePassword:  ApiGenerator.getApi('changePassword'),
    getDistrict:     ApiGenerator.getApi('getDistrict'),
    getBlocks:     ApiGenerator.getApi('getBlocks'),
    getVle:     ApiGenerator.getApi('getVle'),
    getAreatCount:     ApiGenerator.getApi('getAreatCount'),
    getGPs:     ApiGenerator.getApi('getGPs'),
    exportExcel:     ApiGenerator.getApi('exportExcel'),
    exportVleSummary:     ApiGenerator.getApi('exportVleSummary'),
    getDashboard:     ApiGenerator.getApi('getDashboard'),
  })
}])

.factory('ApiGenerator', ["$http", "$resource", "API", "EnvService", function($http, $resource, API, EnvService) {
    return {
      getApi: function(api) {
        var obj = {};
        obj = angular.copy(API[api]);
        obj.url = EnvService.getBasePath() + obj.url;
        return obj;
        console.log(obj);
      }
    }
}])

.factory('EnvService',["$http", "$localStorage", function($http,$localStorage){
  var envData = env = {};
  var settings =  {};

  return{
    setSettings : function(setting) {
      settings = setting;
      this.setEnvData(setting.envData);
    },
    getSettings : function(param) {
      if(param){
        return settings[param];
      }
      return null; // default
    },
    setEnvData: function (data) {
      envData = data[data.env];
    },
    getEnvData: function () {
      return envData;
    },
    getBasePath: function (env) {
      return this.getEnvData()['basePath']
    }
  }
}]);
;app.factory("UserModel",function() {
  var userModel = {};
  userModel.setUser = function(user){
    userModel.user = user;
  }
  userModel.getUser = function(user){
    return userModel.user;
  }
  userModel.unsetUser = function(user){
    userModel.user = null ;
  }
  Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
  userModel.encode = function(data)
  {
    var encode = Base64.encode(data);
    return encode;
  }

  userModel.decode = function(data)
  {
      var decode = Base64.decode(data);
      return decode;
  }
  return userModel;
})
;app.controller("DashBoardController",["$scope", "$rootScope", "$state", "NgTableParams", "ApiCall", "UserModel", "$stateParams", "Util", "$timeout", function($scope,$rootScope,$state,NgTableParams,ApiCall,UserModel,$stateParams,Util,$timeout){
$scope.getDistrict = function(){

  var obj = {};
  if($stateParams.isCover == "true") {
    obj.isCover = true;
  }
  var loggedIn_user = UserModel.getUser();
  if(!loggedIn_user){
    $timeout(function(){
      $scope.getDistrict();
    },1000);
    return;
  }
  else if (loggedIn_user.role.type == "district-admin") {
    obj.district = loggedIn_user.district;
  }
  ApiCall.getDistrict(obj,function(districts) {
    $scope.totalDistrict = new NgTableParams;
    $scope.totalDistrict.settings({
      dataset: districts.data
    });
  }, function(err) {
    Util.alertMessage("danger",err.message);
  })

}
  $scope.getBlocks = function(){

    var obj = {};
    if($stateParams.isCover == "true") {
      obj.isCover = true;
    }
    var loggedIn_user = UserModel.getUser();
    if(!loggedIn_user){
      $timeout(function(){
        $scope.getBlocks();
      },1000);
      return;
    }
    else if (loggedIn_user.role.type == "district-admin") {
      obj.district = loggedIn_user.district;
    }
    ApiCall.getBlocks(obj,function(blocks) {
      $scope.totalBlocks = new NgTableParams;
      $scope.totalBlocks.settings({
        dataset: blocks.data
      });
    }, function(err) {
      Util.alertMessage("danger",err.message);
    })

  }
  $scope.getGPs = function(){

    var obj = {};
    if($stateParams.isCover == "true") {
      obj.isCover = true;
    }
    var loggedIn_user = UserModel.getUser();
    if(!loggedIn_user){
      $timeout(function(){
        $scope.getBlocks();
      },1000);
      return;
    }
    else if (loggedIn_user.role.type == "district-admin") {
      obj.district = loggedIn_user.district;
    }
    ApiCall.getGPs(obj,function(gps) {
      $scope.totalGp = new NgTableParams;
      $scope.totalGp.settings({
        dataset: gps.data
      });
    }, function(err) {
      Util.alertMessage("danger",err.message);
    })

  }




}])
;app.controller("Login_Controller",["$scope", "$rootScope", "$rootScope", "$state", "$localStorage", "NgTableParams", "ApiCall", "$timeout", "UserModel", "Util", function($scope,$rootScope,$rootScope,$state,$localStorage,NgTableParams,ApiCall, $timeout,UserModel,Util){
  $scope.user = {};
  $scope.user.username = ($localStorage.user) ? $localStorage.user.uname : "";
  $scope.user.password = ($localStorage.user) ? UserModel.decode($localStorage.user.password) : "";
  $scope.isViewPassword = function(){
    $scope.viewPassword = !$scope.viewPassword;
  }
  $scope.userLogin = function(){
     $rootScope.showPreloader = true;
    ApiCall.userLogin($scope.user ,function(response){
      if($scope.user.rememberMe)
        $localStorage.user = {
          "uname":$scope.user.username,
          "password":UserModel.encode($scope.user.password)
        }
        UserModel.setUser(response.data.user);
      $rootScope.showPreloader = false;
      $localStorage.token = response.data.token;
      $rootScope.is_loggedin = true;
     $state.go('dashboard');
    },function(error){
      $rootScope.showPreloader = false;
      console.log(error);
      Util.alertMessage('danger',"Invalid username and password");
    })
  }
 
}]);
;/*****************************************************************************************************************/
app.controller("Main_Controller",["$scope", "$rootScope", "$state", "$localStorage", "NgTableParams", "ApiCall", "UserModel", "$uibModal", "$stateParams", "Util", "$timeout", function($scope,$rootScope,$state,$localStorage,NgTableParams,ApiCall,UserModel,$uibModal,$stateParams,Util,$timeout){
   var loggedIn_user = UserModel.getUser();
   $scope.active_tab = 'BD';
   $scope.tabChange = function(tab){
    $scope.active_tab = tab;
   }
  $scope.signOut = function(){
    delete $localStorage.token;
    $rootScope.is_loggedin = false;
    UserModel.unsetUser();
    $state.go('login');
  }
  $scope.checkPassword = function(password, confirmPassword) {
    if (password != confirmPassword) {
      $scope.showPasswordMisMatch = true;
    }
    if (password == confirmPassword) {
      $scope.showPasswordMisMatch = false;
    }
  }
  $scope.changePassword = function(changePass){
    $rootScope.showPreloader = true;
    ApiCall.changePassword(changePass, function(response) {
      console.log(response);
      $rootScope.showPreloader = false;
      LOG.info(response.message);
      $state.go('dashboard');
    },function(error){
      $rootScope.showPreloader = false;
       if(error.data.statusCode == 401){
        LOG.error(error.data.message);
       }
    });

  }
  $scope.checkStateAdmin = function(){
    $scope.stateAdmin = false;
      var loggedIn_user = UserModel.getUser();
      if(loggedIn_user && loggedIn_user.role && loggedIn_user.role.type == "state-admin"){
        $scope.stateAdmin = true;
      }
      else{
        $scope.stateAdmin = false;
      }
      return  $scope.stateAdmin;
  }


  $scope.getUserDetails = function(){
    var loggedIn_user = UserModel.getUser();
    var obj = {
        '_id' : loggedIn_user._id,
      }
        ApiCall.getUser(obj, function(response){
          $scope.userDetails = response.data;
        },function(error){
        });
      }



 }]);
app.controller('DatePickerCtrl' , ['$scope', function ($scope) {
        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        $scope.toggleMin = function() {
            $scope.minDate = new Date();
            $scope.maxDate = new Date();
            $scope.dateMin = null || new Date();
        };
        $scope.toggleMin();

        $scope.open1 = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.mode = 'month';

        $scope.initDate = new Date();
        $scope.formats = ['MM-dd-yyyy', 'dd-MMM-yyyy', 'dd-MMMM-yyyy', 'yyyy-MM-dd', 'dd/MM/yyyy', 'yyyy-MMM','shortDate'];
        $scope.format = $scope.formats[4];
        $scope.format1 = $scope.formats[5];

    }
]);
;app.controller("User_Controller", ["$scope", "$stateParams", "$rootScope", "$uibModal", "$state", "$localStorage", "ApiGenerator", "NgTableParams", "ApiCall", "$timeout", "UserModel", "Util", function($scope, $stateParams,$rootScope, $uibModal,$state, $localStorage, ApiGenerator, NgTableParams, ApiCall, $timeout, UserModel, Util) {
  $scope.vle = {};
  $scope.row = {};
  $scope.filter = {};
  $scope.districtList = [];
  $scope.districtCount = {};
  $scope.urbanVleList = {};
  $scope.vleList = {};
  $scope.gpVleList = {};
  $scope.municipalityList = {};
  $scope.vleFilter = {}; // global object to filter vle
  $scope.selectAll = false;
  $scope.vleExportProperties = [
    "role","name","mobile", "altMobile", "email" ,"digiMail" ,"cscId" ,"religion", "state","district", "block" ,"gp" ,
    "village", "urban", "urbanType","ward" ,"dob" ,"gender" ,"caste", "pan", "adhar", "plotNo", "lane",
    "at", "po" , "city"  ,"dist",  "country" ,"pin", "matricBoard", "matricInstitute" ,"matricPassout",
    "matricPercent", "interBoard" ,"interInstitute" ,"interPassout" ,"interPercent" ,"gradBoard" ,
    "gradInstitute", "gradPassout", "gradPercent" ,"pgBoard", "pgInstitute", "pgPassout", "pgPercent",
    "otherQualification", "cscBuildingArea" ,"personEngaged" ,"webCamera" ,  "furnitureDetails" ,
    "vsatBbDcNofn" ,"pmgDishaId" , "kit" , "providingInsurance" , "eWallet"  ,  "censusCode",
    "cscLattitude", "buildingOwnership"   ,"noOfLaptop", "noOfPrinters", "bioMetric", "commonBranding",
    "powerBackUp" ,"tab", "ProvidingEDistrictServices" , "cscLocation" ,"ownership" ,"cscLongitude" ,
    "cscPin", "status", "isDelete"
  ]
  $scope.initVleList = function() {
    $scope.vleFilter = {};
    $scope.getDistrict();
    $scope.getVles();
  }
	$scope.vleRegdInit = function(){
		$scope.getDistrict();
    ApiCall.getRole({type:"vle"},function(response) {
      $scope.vle.role = response.data[0]._id;
    },function(error) {
      Util.alertMessage('danger',error.message);
    })
	}
  $scope.registerVle = function() {
    $rootScope.showProloader = true;
    ApiCall.registerVle($scope.vle, function(response) {
      $rootScope.showProloader = false;
      $state.go('thankYou');
    }, function(error) {
      $rootScope.showProloader = false;
    });
  }
  $scope.exportVleSummary = function(filter){
    $scope.vleFilter = Object.assign($scope.vleFilter,filter);
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'view/modals/exportVleModal.html',
      controller: 'exportVleModalCtrl',
      size: 'sm',
      resolve: {
        vleExportProperties: function () {
          return $scope.vleExportProperties;
        },
        exportVle: function () {
          return $scope.exportVle;
        }

      }
    });
  }
  $scope.dashboardInit = function() {
    $scope.vleFilter = {};
    $rootScope.showProloader = true;
    ApiCall.getDashboard(function(response) {
      $rootScope.showProloader = false;
      $scope.dashboardDetails = response.data;
    }, function(error) {
      $rootScope.showProloader = false;
    });
  }
  $scope.getVles = function(type) {
    var loggedIn_user = UserModel.getUser();
    var obj = {};
    if($stateParams.urban) {
      obj.urban = $stateParams.urban;
    }
    if (loggedIn_user && loggedIn_user.role && loggedIn_user.role.type == "district-admin") {
      obj.district = loggedIn_user.district;
    }
    if (type == "urban") {
      obj.urban = true;
    }
    $scope.exportLink = $scope.setExportLink(obj);
    ApiCall.getVle(obj, function(response) {
      $scope.row = response.data;
      if (obj.urban == true) {
        $scope.urbanVleList = $scope.row;
      }
      if (obj.urban == false) {
        $scope.gpVleList = $scope.row;
      }
      if (obj.urban == undefined) {
        $scope.vleList = $scope.row;
      }

      $scope.vleTabledata = new NgTableParams;
      $scope.vleTabledata.settings({
        dataset: $scope.row
      });
    }, function(error) {
      console.log(error);
    });
  }

  $scope.filterVles = function() {
    var obj = {};
    var loggedIn_user = UserModel.getUser();
    if ($scope.filter.district && $scope.filter.district != "Select District")
      obj.district = $scope.filter.district;
    if ($scope.filter.block != "" && $scope.filter.block != "Select Block")
      obj.block = $scope.filter.block;
    if ($scope.filter.gp && $scope.filter.gp != "Select GP")
      obj.gp = $scope.filter.gp;
    if (loggedIn_user.role.type == "district-admin") {
      obj.district = loggedIn_user.district;
    }
    $scope.exportLink = $scope.setExportLink(obj);
    ApiCall.getVle(obj, function(response) {
      $scope.vleTabledata = new NgTableParams;
      $scope.vleTabledata.settings({
        dataset: response.data
      });

    }, function(error) {
      console.log(error);
    });
  }

  $scope.exportVle = function(exportProperties){
    exportProperties = exportProperties.toString();
    var obj = {
      exportProperties:exportProperties
    }
    window.open($scope.setExportLink(obj));
  }
  $scope.exportVleModal = function(){
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'view/modals/exportVleModal.html',
      controller: 'exportVleModalCtrl',
      size: 'sm',
      resolve: {
        vleExportProperties: function () {
          return $scope.vleExportProperties;
        },
        exportVle: function () {
          return $scope.exportVle;
        }

      }
    });

  }
  $scope.setExportLink = function(obj) {
    var loggedIn_user = UserModel.getUser();
    if(loggedIn_user.role.type == "district-admin"){
      obj.district = loggedIn_user.district;
    }
    $scope.vleFilter = Object.assign($scope.vleFilter,obj);

    var temp = $state.current.name == "dashboard"  ? ApiGenerator.getApi('exportVleSummary').url + "?" : ApiGenerator.getApi('exportExcel').url + "?";
    var flag = false;
    Object.keys($scope.vleFilter).forEach(function(key, index) {
      if ($scope.vleFilter[key]) {
        if (!flag) {
          temp += key + "=" + $scope.vleFilter[key];
          flag = true;
        } else {
          temp += "&" + key + "=" + $scope.vleFilter[key];
        }

      }
    });
    console.log("#####  "+temp+" ########");
    return temp;

  }


  $scope.getDistrict = function(row) {
    var loggedIn_user = UserModel.getUser();
    var obj = {};
    if (loggedIn_user && loggedIn_user.role.type == "district-admin" && $state.current.name != "vle") {
      obj._id = loggedIn_user.district;
    }
    ApiCall.getDistrict(obj, function(response) {
      $scope.districtList = response.data;
      $scope.districtList.unshift({
        _id: null,
        name: "Select District"
      });
      $scope.filter.district = $scope.districtList[0]._id;
    }, function(error) {
      console.log(error);
    });
  }
  $scope.getBlocks = function(selectedDistrict) {
    var obj = {};
    var loggedIn_user = UserModel.getUser();
    obj.district = selectedDistrict;
    ApiCall.getBlocks(obj, function(response) {
      $scope.blockList = response.data;
      $scope.blockList.unshift({
        _id: null,
        name: "Select Block"
      });
      $scope.filter.block = $scope.blockList[0]._id;
    }, function(error) {
      console.log(error);
    });
  }
  $scope.getGps = function(selectedBlock) {
    var obj = {};
    obj.block = selectedBlock;
    ApiCall.getGPs(obj, function(response) {
      $scope.gpList = response.data;
      $scope.gpList.unshift({
        _id: null,
        name: "Select GP"
      });
      $scope.filter.gp = $scope.gpList[0]._id;
    }, function(error) {
      console.log(error);
    });
  }
  $scope.getAreaCount = function(areaType) {
    var obj = {};
    var loggedIn_user = UserModel.getUser();
    if (loggedIn_user && loggedIn_user.role && loggedIn_user.role.type == "district-admin") {
      obj.district = loggedIn_user.district;
    }
    if (areaType == "district") {
      obj.distinct = "district";
    }
    if (areaType == "gp") {
      obj.distinct = "gp";
    }
    ApiCall.getAreatCount(obj, function(response) {
      if (obj.distinct == "district") {
        $scope.districtCount = response.data;
      }
      if (obj.distinct == "gp") {
        $scope.gpList = response.data;
      }
      if (obj.distinct == "Municipality") {
        $scope.municipalityList = response.data;
      }

    }, function(error) {

    });
  }
  $scope.moreVleDetail = function(vleId){
    console.log(vleId);
    $scope.modalInstance = $uibModal.open({
      animation : true,
      templateUrl : 'view/modals/moreDetails.html',
      controller : 'VleDetailsModalCtrl',
      size: 'md',
      resolve:{
        vleData : function(){
            return vleId
          }
        }

   })
  }
}]);
app.controller('VleDetailsModalCtrl',["$scope", "$state", "$uibModalInstance", "ApiCall", "vleData", function($scope, $state, $uibModalInstance,ApiCall,vleData){
  var obj = {
    _id:vleData
  }
  ApiCall.getVle(obj,function(response) {
    console.log(response);
    $scope.vle = response.data[0];
  },function(err){

  })
  
  $scope.active_tab = 'BD';
  $scope.tabChange = function(tab){
    $scope.active_tab = tab;
  }
 
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);
app.controller('exportVleModalCtrl',["$scope", "$state", "$uibModalInstance", "ApiCall", "vleExportProperties", "exportVle", function($scope, $state, $uibModalInstance,ApiCall,vleExportProperties,exportVle){
  $scope.modalInit = function(){
    $scope.selectAll = false;
    $scope.vleExport = {};
    for(var i in vleExportProperties){
      $scope.vleExport[vleExportProperties[i]] = false;
    }

  }
  $scope.changeSelectAll = function(){
    console.log($scope.selectAll);
    if($scope.selectAll){
      angular.forEach($scope.vleExport, function(value, key) {
        $scope.vleExport[key] = true;
      });
    }
    else{
      angular.forEach($scope.vleExport, function(value, key) {
        $scope.vleExport[key] = false;
      });
    }
  }
  $scope.vleExportProperties = vleExportProperties;
  $scope.vleExport = {};
  $scope.ok = function () {
    console.log($scope.vleExport);
    var exportProperties = [];
    var count = 0;
    var limit = Object.keys($scope.vleExport).length;
    angular.forEach($scope.vleExport, function(value, key) {
      count++;
      if(value){
        exportProperties.push(key);
      }
      if(count >= limit){
        if(!exportProperties.length){
          alert("No item selected");
        }
        else{
          exportVle(exportProperties);
          $uibModalInstance.close();

        }
      }
    });

  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);
;app.directive('fileModell', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
app.directive('updateHeight',function () {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $ta = element;
            var window_height = $(window).height();
            $ta.css({
              'min-height':window_height - 100+'px'
            })
        }
    };
});
app.directive('fileModel', ['$parse', function ($parse) {
   return {
      restrict: 'A',
      scope: {
         fileread: "=",
         filename: "=",
      },
      link: function(scope, element, attrs) {
         element.bind('change', function(){
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
               scope.$apply(function(){
                  scope.fileread = e.target.result;
                  scope.filename = element[0].files[0].name;
               });
            };
            fileReader.readAsDataURL(element[0].files[0]);
         });
      }
   };
}]);
app.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');
                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});
app.directive('floatsOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                    var transformedInput = text.replace(/[^[0-9\.]/g, '');
                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                return undefined;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});
app.directive('capitalize', ["uppercaseFilter", "$parse", function(uppercaseFilter, $parse) {
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
          if(inputValue){
            input = inputValue.toLowerCase();
           var capitalized = input.substring(0,3).toUpperCase();
           if(capitalized !== inputValue) {
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
            }
            return capitalized;
          }
         }
         var model = $parse(attrs.ngModel);
         modelCtrl.$parsers.push(capitalize);
         capitalize(model(scope));
     }
   };
}]);