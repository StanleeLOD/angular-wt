'use strict';

var app = angular.module('wt', ['ui.bootstrap', 'ngCookies', 'ui.router' , 'wt.utilites' , 'wt.services', 'wt.directives']);

app.controller('ClockController', function ($scope, $timeout) {
	$scope.clock = {};
	$scope.clock.UTC = {};
	
	$scope.hoursFormat = 24;

	var updateClock = function() {
		$scope.clock.now = new Date();
		$scope.clock.UTC.hours = new Date().getUTCHours();
		$scope.clock.UTC.minutes = new Date().getUTCMinutes();

		$timeout(function() {
			updateClock();
		}, 1000);
	};

	updateClock();
});

app.controller('CityController', function ($scope, citiesService) {
	// get list of cities from API
	citiesService.getCities()
		.success(function(data) {
			$scope.cities = data;
		});

	$scope.getHoursList = function (timeZone) {
		var current = $scope.getCurrentHour(timeZone);
		var hoursList = [];
		for (var i = current - 13; i <= current + 10; i++) {
			var h = i;
			if (i < 0) {
				h = 24 + i;
			} else if (i > 24) {
				h = i - 24;
			}

			hoursList.push(h);
		}
		return hoursList;
	}

	// replace and get from API
	$scope.homeCity = {};
	$scope.homeCity.timestamp = 5;

	$scope.currentHourSelector = 12;


	$scope.getCurrentHour = function (timeZone) {
		var hours = parseInt($scope.clock.UTC.hours) + parseInt(timeZone);
		
		return hours;
	}


	$scope.setCurrentHour = function(index) {
		$scope.currentHourSelector = index;
	}
	$scope.addCity = function () {
		$scope.cities.push({
			"name": "Novosibirsk",
			"country": "Russia",
			"timeZone": "+7",
			"currentDate": "24.09.2015"
		});
	}

	$scope.removeCity = function (index) {
		$scope.cities.splice(index, 1);
	}
});

app.controller('UserController', function ($scope, $cookies, $state, $http, userService) {
	$scope.login = {};
	$scope.userSettings = {};

	$scope.userCityFilter = function (item) {
		if ($scope.userSettings.cities) {
			for (var i = 0; i < $scope.userSettings.cities.length; i++) {
				if ($scope.userSettings.cities[i] == item.name) {
					return item;
				};
			}
		} else {
			return item;
		}
	}


	$scope.togglePassVisibility = function () {
		var type = (jQuery('#pass').attr('type') == 'password')? 'text' : 'password';
		var eyesIcon = (jQuery('.password-input-group .glyphicon').hasClass('glyphicon-eye-open')) ? 'close' : 'open';

		jQuery('.password-input-group .glyphicon')
			.removeClass('glyphicon-eye-open')
			.removeClass('glyphicon-eye-close')
			.addClass('glyphicon-eye-' + eyesIcon);

		jQuery('#pass').attr('type', type);
	}



	$scope.getUserList = function () {
		var token = $cookies.get('token');

		userService.getUserList(token).then(function(response) {
			$scope.user = response.data;
		});
	}

	$scope.getUsers = function () {
		userService.getUsers().then(function(request) {
			$scope.status = request.status;
			$scope.users = request.data;
		});
	}

	$scope.getLoggedInUser = function () {
		return $cookies.get('loggedInUser');
	}
	
	$scope.token = $cookies.get('token');
	// $scope.loggedInUser  = $cookies.get('loggedInUser');
	// $scope.loggedInUser_login = $cookies.get('loggedInUser_login');
	// $scope.loggedInUser_id = $cookies.get('loggedInUser_id');
	// $scope.loggedInUser_email = $cookies.get('loggedInUser_email');
	
	$cookies.remove('loggedInUser.email');
	$cookies.remove('loggedInUser.login');
	$cookies.remove('loggedInUser.id');
	$cookies.remove('loggedInUser_email');
	$cookies.remove('loggedInUser_login');
	$cookies.remove('loggedInUser_id');

	$scope.logInUser = function (userName, password) {
		userService.logInUser(userName, password).then(function(response) {
			if (response.status = 200) {
				$cookies.put('token', response.data.token);
				
				$cookies.put('loggedInUser', response.data.user.login);
				$cookies.put('loggedInUser_login', response.data.user.login);
				$cookies.put('loggedInUser_id', response.data.user.id);
				$cookies.put('loggedInUser_email', response.data.user.email);
				$state.go('main');
			}
		});
	}

	$scope.getUserData = function () {
		var id = parseInt($scope.loggedInUser_id);
		userService.getUserData(id, $scope.token).then(function (response) {
			console.log(response.data);
		});	
	}

	$scope.updateUser = function () {
		// console.log($scope.token);
		// var user = {
		// 	login: $scope.newLogin || $scope.loggedInUser_login,
		// 	email: $scope.newEmail || $scope.loggedInUser_email,
		// 	password: 
		// }

		// userService.updateUser($scope.token).then
	}

	$scope.signUpUser = function () {
		userService.signUpUser(
			$scope.signUp.userName,
			$scope.signUp.password,
			$scope.signUp.email
		).then(function(data) {
			if (data.status == 201) {
				$scope.logInUser($scope.signUp.userName, $scope.signUp.password);
			}
		});
	}

	$scope.logOutUser = function () {
		$cookies.put('loggedInUser', '');	
		$state.go('main');
	}

});

app.filter('customTime', function () {
	return function (input) {
		return input.toString().length < 2 ? '0' + input : input;
	}
});


app.provider("httpRequest", function () {
	var response;
	return {
		sendRequest: function () {

			function handler() {
				console.log(this);
			  if(this.status == 200 &&
			    this.response != null) {

			  	response = this.response;
			  	console.log(response);
			  } else {
			    console.log('http response error');
			  }
			}

			var client = new XMLHttpRequest();
			client.onload = handler;
			client.open("GET", "/");
			client.send();
		},
		$get: function () {
			return {
			 	data: responses
			}
		}
	}
	
});

app.config([
	'$stateProvider', '$urlRouterProvider', 'httpRequestProvider',
	function($stateProvider, $urlRouterProvider, httpRequestProvider) {
		httpRequestProvider.sendRequest();
		


			$urlRouterProvider.when('', '/');

				$stateProvider
					.state('main', {
						url: "",
						templateUrl: "partials/main.html",
						controller: 'UserController'
					})
					.state('clock', {
						url: "/",
						parent: "main",
						templateUrl: "partials/clocks.html",
						controller: "UserController"
					})
					.state('login', {
						url: "/login",
						parent: 'main',
						templateUrl: "partials/login.html",
						controller: 'UserController'
					})
					.state('signUp', {
						url: "/signup",
						parent: 'main',
						templateUrl: 'partials/signUp.html',
						controller: "UserController"
					})
					.state('user', {
						url: '/user',
						parent: 'main',
						templateUrl: "partials/user.html",
						controller: 'UserController'
					});
		// });
}]);






'use strict';


angular.module('wt.directives', ['wt.utilites'])
	.directive('showHours', function(utilites) {

		function timeFormatChanger(scope, element, attrs) {

			var showDate = attrs.showDate;
			var showAmPm = attrs.showAmPm;
			var minutes  = attrs.minutes;

			// add zero if val.length < 2
			function addZero(val) {
				return val = val.length < 2 ? '0' + val : val;
			}

			function getDay(day) {

			}

			// return short mounth name
			function getMounth(num) {
				var mounthNames = [
					"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
				];

				return mounthNames[num];
			}

			// return a.m or p.m from 24 format hours
			function getDayPart(hours) {
				return hours >= 12 ? 'p.m' : 'a.m';
			}

			function updateTime(format) {
				var hours = attrs.showHours;
				var html = (hours >= format) ? hours - format : hours;
				html = html + '';
				html = addZero(html);

				if (format !== 24 && format !== 12) {
					format = 24;
				} 

				// add minutes
				if (minutes) {
					html += ':' + addZero(minutes);
				}
				// if it's a new day- show date
				if (showDate == 'true') {
					var date = new Date();
					var day = date.getDate();
					var mounth = date.getMonth();
					if (hours == '24') {
						html = addZero(day + 1) + "<span class='mounth'>" + getMounth(mounth) + "</span>";
					} else if (hours == '0') {
						html = addZero(day) + "<span class='mounth'>" + getMounth(mounth) + "</span>";
					}
				}
				
				// add am/pm day part
				if (showAmPm == 'true' && hours !== "24" && hours !== '0' && format !== 24) {
					html += "<span class='day-part'>" + getDayPart(hours) + "</span>";
				}

				element.html(html);

			};

			scope.$watch('hoursFormat', function(value) {
				updateTime(value);
			});

			// TODO: add timeout on hr
			

			// 24hrs= default format
			updateTime(24);
		}

		return {
			restrict: 'A',
			link: timeFormatChanger
		};
	})


	.directive('showDay', function() {

	});



'use strict';

angular.module('wt.services', [])
	.factory('citiesService', function ($http) {
		var returnCities = function () {
			return $http({
				method: "POST",
				url: "../../cities.json"
			});
		}

		return {
			getCities: function () {
				return returnCities();
			}
		}
	})
	.factory('userService', function ($http) {
		var apiUrl = "http://s.q-man.ru:3000/";

		return {
			signUpUser: function (userName, password, email) {
				return $http({
					method: "POST",
					url: apiUrl + "user",
					data: {
						"login": userName,
						"password": password,
						"email": email
					}
				});
			},
			getUsers: function () {
				return $http({
					method: "GET",
					url: apiUrl + "users"
				});
			},
			getUser: function (users, userName) {
				return _.find(users, function(user) {
					return user.login == userName
				});
			},
			getUserData: function (id, token) {
				return $http({
					method: "GET",
					url: apiUrl + 'auth/user/' + id,
					headers: {
						Authorization: token
					}
				})
			},
			logInUser: function (userName, password) {
				var userData = {
					login: userName,
					password: password
				};

				return $http.post(apiUrl + "user/login", userData);
			},
			getUserList: function (token) {
				return $http({
					method: "GET",
					url: apiUrl + 'auth/users',
					headers: {
						Authorization: token
					}
				});
			},
			updateUser: function (user, token) {
				return $http({
					method: 'PUT',
					url: apiUrl + "/user/" + user.id,
					data: user,
					headers: {
						Authorization: token
					}
				});
			}
		}
	});


angular.module('wt.utilites', [])
	.factory('utilites', function() {
		return {
			addZero: function(val) {
				return val = val.length < 2 ? '0' + val : val;
			}
		}
	})