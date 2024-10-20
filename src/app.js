const myApp = angular.module('myApp', ['ngRoute']);

myApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'src/app.html',
            controller: 'MainController',
        })
        .when('/signup', {
            templateUrl: 'src/pages/signup.html',
            controller: 'SignUpController'
        })
        .when('/signin', {
            templateUrl: 'src/pages/login.html',
            controller: 'MainController'
        })
        .when('/verify', {
            templateUrl: 'src/pages/verify.html',
            controller: 'verifyController'
        })
        .when('/home', {
            templateUrl: 'src/pages/home.html',
            controller: 'MainController'
        })
        .otherwise({
            redirectTo: '/'
        })
}])

myApp.controller('MainController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.button = 'Submit';

    $scope.toSigninPage = function() {
        $location.path("/signin");
    }

    $scope.toSignupPage = function() {
        $location.path("/signup");
    }

    $scope.submit = function() {
        $scope.button = 'Loading...';
        $http.post('http://localhost:3000/auth/signin', $scope.user).then(function (response) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            $location.path("/verify");
        }, function (reject) {
            $scope.msg = reject.data ? reject.data.message : 'Sign in unsuccessfully';
            $scope.button = 'Submit';
        })
    }
}]);

myApp.controller('SignUpController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.button = 'Submit';

    $scope.submit = function() {
        $scope.button = 'Loading...';
        $http.post('http://localhost:3000/auth/signup', $scope.user).then(function (response) {
            $location.path("/signin");
        }, function (reject) {
            $scope.msg = reject.data ? reject.data.message : 'Sign up unsuccessfully';
            $scope.button = 'Submit';
        })
    }
}]);

myApp.controller('verifyController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.resendBtn = 'Resend';
    $scope.verifyBtn = 'Verify';

    const inputs = document.querySelectorAll("input");
    const button = document.getElementById("verifyBtn");
    inputs.forEach((input, index1) => {
        input.addEventListener("keyup", (e) => {
        const currentInput = input,
            nextInput = input.nextElementSibling,
            prevInput = input.previousElementSibling;
        if (currentInput.value.length > 1) {
            currentInput.value = "";
            return;
        }
        if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
            nextInput.removeAttribute("disabled");
            nextInput.focus();
        }
        if (e.key === "Backspace") {
            inputs.forEach((input, index2) => {
            if (index1 <= index2 && prevInput) {
                input.setAttribute("disabled", true);
                input.value = "";
                prevInput.focus();
            }
            });
        }
        if (!inputs[5].disabled && inputs[5].value !== "") {
            button.classList.add("active");
            return;
        }
        button.classList.remove("active");
        });
    });
    window.addEventListener("load", () => inputs[0].focus());

    $scope.sendCode = function(e) {
        if (e.submitter.id === "verifyBtn") {
            $scope.verifyBtn = 'Loading...';
            const verifiedCode = joinObject($scope.code);
            if (!verifiedCode || verifiedCode.length !== 6) {
                $scope.msg = "Please fill out your code";
                return;
            }
            const accessToken = localStorage.getItem('accessToken');
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
            $http.post('http://localhost:3000/auth/verify', {code: verifiedCode}).then(function (response) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                $location.path("/home");
            }, function (reject) {
                if (reject.data) {
                    switch (reject.data.message) {
                        case 'Unauthorized':
                            $scope.msg = 'The confirmation code has expired';
                            break;
                        case 'Internal server error':
                            $scope.msg = 'Sent unsuccessfully';
                            break;
                        default:
                            $scope.msg = reject.data.message;
                    }
                } else {
                    $scope.msg = 'Sent unsuccessfully';
                }
                $scope.verifyBtn = 'Verify';
            })
        } else {
            $scope.resendBtn = 'Loading...';
            const refreshToken = localStorage.getItem('refreshToken');
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + refreshToken;
            $http.post('http://localhost:3000/auth/resend').then(function (response) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                $scope.resendBtn = 'Resend';
                $scope.msg = 'Please check your email!';
            }, function (reject) {
                $scope.msg = 'Please request again!';
                $scope.resendBtn = 'Resend';
            })
        }
    }

    joinObject = function(object) {
        if (!object) return null;
        let text = "";
        for (const prop in object) {
            text += object[prop];
        }
        return text;
    }
}]);